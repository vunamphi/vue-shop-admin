// // server.js (sạch, không nhân đôi route)
// "json-server": "^1.0.0-beta.3",
// "express": "^5.1.0",
// "body-parser": "^2.2.0",


const jsonServer = require("json-server");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const querystring = require("qs");
const { VNPay, ignoreLogger } = require("vnpay");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
server.use(middlewares);
server.use(jsonServer.bodyParser);

const SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3001;

// Email config
const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT ?? 587,
  secure: false,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAIL_PASS,
  },
});

// VNPay config
const VNP_TMN_CODE = process.env.VNP_TMN_CODE,
  VNP_HASH_SECRET = process.env.VNP_HASH_SECRET,
  VNP_URL = process.env.VNP_URL,
  VNP_HOST = process.env.VNP_HOST,
  VNP_RETURN_URL = process.env.VNP_RETURN_URL || "http://localhost:5173/thankyou";

const vnpay = new VNPay({
  tmnCode: VNP_TMN_CODE,
  secureSecret: VNP_HASH_SECRET,
  vnpayHost: VNP_HOST,
  testMode: true,
  hashAlgorithm: "SHA512",
  enableLog: true,
  loggerFn: ignoreLogger,
  endpoints: {
    paymentEndpoint: "paymentv2/vpcpay.html",
    getBankListEndpoint: 'qrpayauth/api/merchant/get_bank_list',
  },
});

// Auth helpers
function createToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
}
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
function getUser(db, { username, password }) {
  return db.get("users").find({ username, password }).value();
}

// ------------------- Auth routes -------------------
server.post("/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ message: "Thiếu username hoặc password" });

  const db = router.db;
  const exists = db.get("users").find({ username }).value();
  if (exists) return res.status(409).json({ message: "Username đã tồn tại" });

  const id = (db.get("users").map("id").max().value() || 0) + 1;
  const user = { id, username, password, role: "user" };
  db.get("users").push(user).write();

  const token = createToken({ sub: user.id, username });
  res.status(201).json({ user, access_token: token });
});

server.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  const db = router.db;
  const user = getUser(db, { username, password });
  if (!user) return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });

  const token = createToken({ sub: user.id, username });
  res.json({ user, access_token: token });
});

// ========================= ORDERS ========================= //

// Create order (POST /orders)
server.post("/orders", async (req, res) => {
  try {
    const { user, cart, totalPrice, paymentMethod, discountCode } = req.body;
    if (!user || !cart || !totalPrice)
      return res.status(400).json({ error: "Thiếu thông tin đơn hàng" });

    const db = router.db;

    // check stock
    for (const item of cart) {
      const product = db.get("products").find({ id: item.id }).value();
      if (!product || (product.stock || 0) < item.quantity) {
        return res.status(400).json({ error: `Sản phẩm ${item.name} đã hết hàng` });
      }
    }

    // decrement stock
    cart.forEach((item) => {
      const current = db.get("products").find({ id: item.id }).value();
      db.get("products")
        .find({ id: item.id })
        .assign({ stock: (current.stock || 0) - item.quantity })
        .write();
    });

    // create order (id as string)
    const orderId = Date.now().toString();
    const order = {
      id: orderId,
      user, // username or email string
      cart,
      totalPrice,
      paymentMethod,
      discountCode,
      status: paymentMethod === "cod" ? "Chờ giao hàng" : "Chờ thanh toán",
      createdAt: new Date().toISOString(),
    };

    db.get("orders").push(order).write();

    // try send email but don't block on failure
    (async () => {
      try {
        const adminEmail = "tabletkindfire@gmail.com";
        const content = `
          <h3>Đơn hàng mới #${orderId}</h3>
          <p>Khách hàng: ${user}</p>
          <p>Tổng tiền: ${totalPrice.toLocaleString()}₫</p>
          <p>Phương thức: ${paymentMethod}</p>
        `;
        await transporter.sendMail({
          from: '"Shop" <tabletkindfire@gmail.com>',
          to: [user, adminEmail],
          subject: `Xác nhận đơn hàng #${orderId}`,
          html: content,
        });
      } catch (e) {
        console.warn("Email send failed:", e && e.message);
      }
    })();

    // VNPay branch (if vnpay needed)
    if (paymentMethod === "vnpay") {
      const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const createDate = new Date();
      const dateString = createDate.toISOString().replace(/[-T:Z.]/g, "").slice(0, 14);

      const vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: VNP_TMN_CODE,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
        vnp_OrderType: "other",
        vnp_Amount: totalPrice * 100,
        vnp_ReturnUrl: VNP_RETURN_URL,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: dateString,
      };

      const sorted = Object.keys(vnp_Params)
        .sort()
        .reduce((obj, key) => {
          obj[key] = vnp_Params[key];
          return obj;
        }, {});

      const signData = querystring.stringify(sorted, { encode: false });
      const hmac = crypto.createHmac("sha512", VNP_HASH_SECRET);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
      const paymentUrl =
        VNP_URL +
        "?" +
        querystring.stringify(sorted, { encode: true }) +
        `&vnp_SecureHash=${signed}`;

      return res.status(200).json({ paymentUrl });
    }

    // return created order (important for frontend)
    return res.status(201).json(order);
  } catch (err) {
    console.error("POST /orders error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
});

// Get orders (all or filter by ?user=username)
server.get("/orders", (req, res) => {
  try {
    const db = router.db;
    const { user } = req.query;
    const orders = db.get("orders").value() || [];
    if (user) {
      const filtered = orders.filter((o) => o.user && String(o.user).toLowerCase() === String(user).toLowerCase());
      return res.json(filtered);
    }
    return res.json(orders);
  } catch (err) {
    console.error("GET /orders error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// PATCH update status safely (keeps other fields)
server.patch("/orders/:id", (req, res) => {
  try {
    const db = router.db;
    const { id } = req.params;
    const { status } = req.body;

    const order = db.get("orders").find({ id }).value();
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // Merge and write whole object (avoid assign({status}) only)
    const updated = { ...order, status };
    db.get("orders").find({ id }).assign(updated).write();

    const updatedOrder = db.get("orders").find({ id }).value();
    return res.json({ message: "Cập nhật thành công", order: updatedOrder });
  } catch (err) {
    console.error("PATCH /orders/:id error:", err);
    return res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái" });
  }
});

// VNPay verify (unchanged)
server.get("/verify", (req, res) => {
  try {
    const verify = vnpay.verifyReturnUrl(req.query);
    if (verify.isSuccess) {
      const db = router.db;
      const orderId = req.query.vnp_TxnRef;
      db.get("orders").find({ id: orderId }).assign({ status: "Đã thanh toán" }).write();
      return res.redirect(VNP_RETURN_URL);
    }
    return res.status(400).json({ message: "Xác minh thất bại" });
  } catch (err) {
    console.error("GET /verify error:", err);
    return res.status(500).json({ message: "Lỗi verify" });
  }
});

// ------------------- Favorites / Reviews / other routes -------------------
// (keep as you had, but without /api prefix if you want consistency)
// Example favorites endpoints (no change required if you already adjusted frontend)
server.post("/favorites", (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) return res.status(400).json({ message: "Thiếu thông tin" });
  const db = router.db;
  const favs = db.get("favorites").value() || [];
  const exists = favs.find((f) => f.userId === userId && f.productId === productId);
  if (exists) {
    db.get("favorites").remove({ userId, productId }).write();
    return res.json({ message: "Đã xóa khỏi yêu thích" });
  }
  db.get("favorites").push({ userId, productId }).write();
  return res.json({ message: "Đã thêm vào yêu thích" });
});

server.get("/favorites", (req, res) => {
  const { userId } = req.query;
  const favs = router.db.get("favorites").filter({ userId }).value() || [];
  res.json(favs);
});

server.post("/reviews", (req, res) => {
  const { productId, user, rating, comment } = req.body;
  if (!productId || !user || !rating) return res.status(400).json({ message: "Thiếu dữ liệu" });
  const db = router.db;
  const review = { id: Date.now(), productId, user, rating, comment, createdAt: new Date().toISOString() };
  db.get("reviews").push(review).write();
  res.json({ message: "Đánh giá thành công" });
});

server.get("/reviews", (req, res) => {
  const { productId } = req.query;
  const reviews = router.db.get("reviews").filter({ productId }).value() || [];
  res.json(reviews);
});

// Auth middleware (keep original logic)
server.use((req, res, next) => {
  const needAuth = req.method === "GET" && req.path.startsWith("/users");
  if (!needAuth) return next();

  const auth = req.headers.authorization || "";
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

// // mount router (json-server default routes)
server.use(router);

server.listen(PORT, () => {
  console.log(`🚀 Server listen in http://localhost:${PORT}`);
});

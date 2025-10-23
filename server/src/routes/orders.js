const { transporter } = require("../config/email");
const { vnpay, VNP_RETURN_URL } = require("../config/vnpay");

const orderRoutes = (server) => {
  const db = server.db; // MEMORY - NHANH!

  server.post("/orders", async (req, res) => {
    try {
      const { user, cart, totalPrice, paymentMethod,userId } = req.body;
      if (!user || !cart || !totalPrice || !userId)
        return res.status(400).json({ error: "Thiếu thông tin" });


      // Check stock (MEMORY - SIÊU NHANH)
      for (const item of cart) {
        const product = db.get("products").find({ id: item.id }).value();
        if (!product || (product.stock || 0) < item.quantity) {
          return res.status(400).json({ error: `Hết hàng: ${item.name}` });
        }
      }

      const orderId = Date.now().toString();
      const order = {
        id: orderId, user, cart, totalPrice, paymentMethod,
        userId: userId,
        status: paymentMethod === "cod" ? "Chờ giao hàng" : "Chờ thanh toán",
        createdAt: new Date().toISOString(),
      };

      // 🔥 1. PUSH MEMORY (0ms)
      // db.get("orders").push(order).value();

      db.get("orders").push(order).write();
      
      // 🔥 2. ASYNC WRITE FILE (NON-BLOCKING)
      // (async () => {
      //   const state = db.getState();
      //   await server.asyncWrite(state);
      // })();

      console.log(`✅ Order #${orderId} OK`);

      // Email NON-BLOCKING
      (async () => {
        try {
          await transporter.sendMail({
            from: '"Shop" <tabletkindfire@gmail.com>',
            to: [user, "tabletkindfire@gmail.com"],
            subject: `Đơn hàng #${orderId}`,
            html: `<h3>Đơn #${orderId}</h3>`,
          });
        } catch (e) {
          console.warn("Email failed:", e.message);
        }
      })();

      // VNPay
      if (paymentMethod === "vnpay") {
        const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const paymentUrl = vnpay.buildPaymentUrl({
          vnp_Amount: totalPrice,
          vnp_IpAddr: ipAddr,
          vnp_ReturnUrl: VNP_RETURN_URL,
          vnp_TxnRef: orderId,
          vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
        });
        return res.json({ paymentUrl, orderId });
      }

      // 🔥 RESPONSE NGAY - 0ms delay!
      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Các routes khác GIỮ NGUYÊN
  server.get("/orders", (req, res) => {
    const { user } = req.query;
    const orders = server.db.get("orders").value();
    console.log(user);
    
    const users = server.db.get("users").value();
    const isLoadALl = users.filter(u => {
      return (u.id === user && u?.role === "admin")
    });
    
    if (user && !isLoadALl) return res.json(orders.filter(o => o.user === user));
    res.json(orders);
  });

  // server.patch("/orders/:id", async (req, res) => {
  //   const { id } = req.params;
  //   const { status } = req.body;
    
  //   const order = server.db.get("orders").find({ id }).value();
  //   if (!order) return res.status(404).json({ message: "Không tìm thấy" });

  //   server.db.get("orders").find({ id }).assign({ status }).value();
    
  //   // Async save
  //   (async () => {
  //     const state = server.db.getState();
  //     await server.asyncWrite(state);
  //   })();

  //   res.json({ message: "Cập nhật OK", order });
  // });
  server.patch("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Thiếu trạng thái" });
    }

    const order = server.db.get("orders").find({ id }).value();
    if (!order) {
      return res.status(404).json({ error: "Đơn hàng không tìm thấy" });
    }

    // Gán trạng thái mới
    server.db.get("orders").find({ id }).assign({ status }).write();  
    // .write() ngay để chắc state được lưu nếu dùng lowdb/memory DB  

    // Lấy lại đơn hàng đã cập nhật
    const updatedOrder = server.db.get("orders").find({ id }).value();

    // Trả về theo client mong đợi
    return res.json({ order: updatedOrder });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật đơn hàng:", err);
    return res.status(500).json({ error: err.message });
  }
});



};

module.exports = orderRoutes;
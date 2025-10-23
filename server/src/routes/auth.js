const { createToken } = require("../utils/jwt");

const authRoutes = (server) => {
  const db = server.db;  // ← Lấy db từ server

  server.post("/register", (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ message: "Thiếu username hoặc password" });

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
    const user = db.get("users").find({ username, password }).value();
    if (!user) return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });

    const token = createToken({ sub: user.id, username });
    res.json({ user, access_token: token });
  });
};

module.exports = authRoutes;
const favoritesRoutes = (server) => {
  const db = server.db;
  // POST /favorites - Toggle yêu thích (thêm/xóa)
  server.post("/favorites", (req, res) => {
    const { userId, productId } = req.body;
    if (!userId || !productId) 
      return res.status(400).json({ message: "Thiếu userId hoặc productId" });
    
   
    const favs = db.get("favorites").value() || [];
    const exists = favs.find((f) => f.userId === userId && f.productId === productId);
    
    if (exists) {
      // Xóa khỏi yêu thích
      db.get("favorites").remove({ userId, productId }).write();
      return res.json({ message: "Đã xóa khỏi yêu thích" });
    }
    
    // Thêm vào yêu thích
    db.get("favorites").push({ userId, productId }).write();
    return res.json({ message: "Đã thêm vào yêu thích" });
  });

  // GET /favorites?userId=1 - Lấy danh sách yêu thích của user
  server.get("/favorites", (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "Thiếu userId" });
    
    const favs = db.get("favorites").filter({ userId }).value() || [];
    res.json(favs);
  });
};

module.exports = favoritesRoutes;
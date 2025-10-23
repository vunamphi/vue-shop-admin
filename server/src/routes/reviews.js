const reviewsRoutes = (server) => {
  const db = server.db;
  // POST /reviews - Thêm đánh giá
  server.post("/reviews", (req, res) => {
    const { productId, user, rating, comment } = req.body;
    if (!productId || !user || !rating) 
      return res.status(400).json({ message: "Thiếu productId, user hoặc rating" });
    
    if (rating < 1 || rating > 5) 
      return res.status(400).json({ message: "Rating phải từ 1-5 sao" });
    
    
    const review = { 
      id: Date.now().toString(),
      productId: parseInt(productId),
      user,
      rating: parseInt(rating),
      comment: comment || "",
      createdAt: new Date().toISOString()
    };
    
    db.get("reviews").push(review).write();
    res.status(201).json({ message: "Đánh giá thành công", review });
  });

  // GET /reviews?productId=1 - Lấy danh sách đánh giá sản phẩm
  server.get("/reviews", (req, res) => {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ message: "Thiếu productId" });
    
    const reviews = db.get("reviews")
      .filter({ productId: parseInt(productId) })
      .sortBy('createdAt')
      .reverse()
      .value() || [];
    
    // Tính trung bình rating
    const averageRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;
    
    res.json({ 
      reviews, 
      averageRating: parseFloat(averageRating),
      totalReviews: reviews.length 
    });
  });
};

module.exports = reviewsRoutes;
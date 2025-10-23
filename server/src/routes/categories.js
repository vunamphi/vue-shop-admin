const categoriesRoutes = (server) => {
  // GET /categories - Lấy tất cả danh mục
  server.get("/categories", (req, res) => {
    try {
      const db = server.db;
      const categories = db.get("categories").value() || [];
      res.json(categories);
    } catch (err) {
      console.error("GET /categories error:", err);
      res.status(500).json({ message: "Lỗi server" + err});
    }
  });

  // GET /categories/:id - Lấy danh mục theo ID
  server.get("/categories/:id", (req, res) => {
    try {
      const db = server.db;
      const { id } = req.params;
      const category = db.get("categories").find({ id: parseInt(id) }).value();
      if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });
      res.json(category);
    } catch (err) {
      res.status(500).json({ message: "Lỗi server" + err});
    }
  });

  // GET /categories?search=abc - Tìm kiếm danh mục
  server.get("/categories", (req, res) => {
    try {
      const db = server.db;
      const { search } = req.query;
      let categories = db.get("categories").value() || [];
      
      if (search) {
        categories = categories.filter(cat => 
          cat.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: "Lỗi server"+ err });
    }
  });
};

module.exports = categoriesRoutes;
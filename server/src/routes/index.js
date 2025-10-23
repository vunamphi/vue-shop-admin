const authRoutes = require("./auth");
const orderRoutes = require("./orders");
const favoritesRoutes = require("./favorites");
const reviewsRoutes = require("./reviews");
const categoriesRoutes = require("./categories");

const initRoutes = (server) => {
  console.log("🔥 Hybrid JSON-Server + FS Writer!");
  
  authRoutes(server);
  orderRoutes(server);
  favoritesRoutes(server);
  reviewsRoutes(server);
  categoriesRoutes(server);
  
  console.log("✅ ALL ROUTES ready!");
};

module.exports = initRoutes;
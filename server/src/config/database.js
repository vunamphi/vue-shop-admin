const jsonServer = require("json-server");
const initRoutes = require("../routes");

const createServer = () => {
  const server = jsonServer.create();
  const router = jsonServer.router("db.json"); // DB + DEFAULT CRUD
  const middlewares = jsonServer.defaults();
  
  server.use(middlewares);
  server.use(jsonServer.bodyParser);
  
  // 🔥 GẮN DB CHO CUSTOM ROUTES
  server.db = router.db;
  
  // 🔥 CUSTOM ROUTES TRƯỚC
  initRoutes(server);
  
  // 🔥 DEFAULT ROUTES SAU (CRUD /products, /users)
  server.use(router);
  
  return server;
};

module.exports = { createServer };
require("dotenv").config();
const { createServer } = require("./config/database");


const PORT = process.env.PORT || 3001;
const server = createServer();


server.listen(PORT, () => {
  console.log(`🚀 Server listen in http://localhost:${PORT}`);
}); 
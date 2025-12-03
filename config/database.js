//----ChatGPT Helped----//
// config/database.js
require('dotenv').config(); // load env vars here too (important for Render)

module.exports = {
  url: process.env.MONGO_URI,
  dbName: 'AlphaTest'
};
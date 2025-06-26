// ✅ Load environment variables at the very top

const dotenv = require('dotenv');
dotenv.config(); // MUST come before using any env variables

// ✅ Debug output
console.log("PORT:", process.env.PORT);
console.log("MONGO_DB:", process.env.MONGO_DB);

const express = require('express');
const cors = require('cors');
const DBConnection = require('./config/connect');
const path = require("path");
const fs = require('fs');

const app = express();

console.log("Current directory:", __dirname);
console.log(".env exists:", fs.existsSync(__dirname + "/.env"));
// ✅ Use environment variables now
const PORT = process.env.PORT || 5000;
DBConnection(); // Will crash if MONGO_DB is undefined

app.use(express.json());
app.use(cors());


const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use("/uploads", express.static(uploadsDir));

app.use('/api/admin', require('./routers/adminRoutes'));
app.use('/api/user', require('./routers/userRoutes'));

app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));

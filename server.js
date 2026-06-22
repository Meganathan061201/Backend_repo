require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const moderatorRoutes = require("./routes/moderator.routes");
const uploadRoutes = require("./routes/upload.routes");
const { UPLOAD_DIR } = require("./middleware/upload");

const app = express();

connectDB();
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/moderator", moderatorRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("RBAC API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const progressRoutes = require("./routes/progressRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://lms-frontend-mu-two.vercel.app"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DB Connection
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("DB connection error:", err));

// Default Route
app.get("/", (req, res) => {
  res.send("Welcome to Gessdemn LMS API");
});

// API Routes
app.use("/api/v1/blogs", require("./routes/blogRoutes"));
app.use("/api/v1/lessons", require("./routes/LessionRoutes"));
app.use("/api/v1/modules", require("./routes/moduleRoutes"));
app.use("/api/v1/quizzes", require("./routes/quizRoutes"));
app.use("/api/v1/courses", require("./routes/courseRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/v1/instructors", require("./routes/instructorRoutes"));
app.use("/api/v1/students", require("./routes/studentRoute"));
app.use("/api/v1/mentorship", require("./routes/slotRoutes"));
app.use("/api/v1/progress", progressRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

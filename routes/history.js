const express = require("express");
const CookingHistory = require("../models/CookingHistory");
const jwt = require("jsonwebtoken");

const router = express.Router();

// 🔑 Middleware to check auth token
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded; // attach user payload to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// 📜 Get logged-in user's cooking history (last 5)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const history = await CookingHistory.find({ user: req.user.id })
      .populate("recipe", "name time_required difficulty")
      .sort({ cookedAt: -1 })
      .limit(5);

    res.json(history);
  } catch (err) {const express = require("express");
const History = require("../models/History");
const auth = require("../middleware/auth");

const router = express.Router();

// Get cooking history for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const history = await History.find({ user: req.user.id }).populate("recipe");
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

module.exports = router;

    console.error(err);
    res.status(500).json({ message: "Error fetching cooking history" });
  }
});

module.exports = router;

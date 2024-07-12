const express = require("express");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");

const router = express.Router();

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader); // Log authorization header
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err.message); // Log error details
      return res.status(401).json({ message: "Invalid token" });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

router.post("/", authenticate, async (req, res) => {
  if (req.userRole !== "vendor") {
    return res.status(403).json({ message: "Only vendors can add products" });
  }
  const { name, price, description, category, stock } = req.body;
  const product = new Product({
    vendor: req.userId,
    name,
    price,
    description,
    category,
    stock,
  });
  await product.save();
  res.status(201).json({ message: "Product added successfully" });
});

router.get("/", async (req, res) => {
  const products = await Product.find().populate("vendor", "username");
  res.json(products);
});

module.exports = router;

const express = require('express');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

const router = express.Router();

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

router.post('/', authenticate, async (req, res) => {
  if (req.userRole !== 'vendor') {
    return res.status(403).json({ message: 'Only vendors can add products' });
  }
  const { name, price, description, category, stock } = req.body;
  const product = new Product({ vendor: req.userId, name, price, description, category, stock });
  await product.save();
  res.status(201).json({ message: 'Product added successfully' });
});

router.get('/', async (req, res) => {
  const products = await Product.find().populate('vendor', 'username');
  res.json(products);
});

module.exports = router;

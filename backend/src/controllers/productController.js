const express = require('express');
const router = express.Router();
const multer = require('multer');
const connection = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// แก้ไขเส้นทางให้สัมพันธ์กับโครงสร้างโครงการ
const uploadPath = path.join(__dirname, '../../frontend/public/product');

// สร้างโฟลเดอร์หากยังไม่มี
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ฟังก์ชันสำหรับ sanitize ชื่อไฟล์
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9_\-\.]/gi, '_').toLowerCase();
};

// ตั้งค่าการอัปโหลดด้วย multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const sanitizedFilename = Date.now() + '-' + sanitizeFilename(file.originalname);
    cb(null, sanitizedFilename);
  },
});

const upload = multer({ storage });

// 1. Route: Get all products
router.get('/products', (req, res) => {
  const { product_type } = req.query;
  const typeQuery = product_type ? `WHERE product_type = ?` : '';
  const query = `
    SELECT 
      product_id, 
      product_name, 
      product_image, 
      product_type
    FROM products
    ${typeQuery};
  `;
  const queryParams = product_type ? [product_type] : [];

  connection.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Database query error' });
      return;
    }
    res.status(results.length > 0 ? 200 : 404).json(
      results.length > 0 ? results : { message: 'No products found' }
    );
  });
});

// 2. Route: Get product details by ID
router.get('/product-detail/:product_id', (req, res) => {
  const { product_id } = req.params;
  const query = `
    SELECT 
      product_id, 
      product_name, 
      product_type, 
      product_unit, 
      product_quantity, 
      threshold, 
      product_image 
    FROM products 
    WHERE product_id = ?;
  `;

  connection.query(query, [product_id], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Failed to fetch product details' });
      return;
    }
    res.status(results.length > 0 ? 200 : 404).json(
      results.length > 0 ? results[0] : { message: 'Product not found' }
    );
  });
});

// 3. Route: Get lots by product ID
router.get('/product/:product_id/lots', (req, res) => {
  const { product_id } = req.params;
  const query = `
    SELECT 
      lot_id, 
      product_id, 
      lot_date, 
      lot_exp, 
      lot_quantity 
    FROM product_lots 
    WHERE product_id = ?;
  `;

  connection.query(query, [product_id], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Failed to fetch lot details' });
      return;
    }
    res.status(results.length > 0 ? 200 : 404).json(
      results.length > 0 ? results : { message: 'No lots found for this product' }
    );
  });
});

// 4. Route: Get lot details by lot ID
router.get('/lot-detail/:lot_id', (req, res) => {
  const { lot_id } = req.params;
  const query = `
    SELECT 
      pl.lot_id, 
      pl.product_id, 
      pl.lot_date, 
      pl.lot_exp, 
      pl.lot_quantity,
      p.product_name,
      p.product_unit,
      p.product_type,
      p.product_image
    FROM product_lots AS pl
    JOIN products AS p ON pl.product_id = p.product_id
    WHERE pl.lot_id = ?;
  `;

  connection.query(query, [lot_id], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Failed to fetch lot detail' });
      return;
    }
    res.status(results.length > 0 ? 200 : 404).json(
      results.length > 0 ? results[0] : { message: 'Lot not found' }
    );
  });
});

// 5. Route: Add product with image upload
router.post('/add-product', upload.single('product_image'), (req, res) => {
  const { product_name, product_type, product_unit, product_quantity, threshold } = req.body;
  const product_image = req.file ? req.file.filename : null;
  const product_id = 'PROD-' + uuidv4();

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const query = `
    INSERT INTO products (product_id, product_name, product_type, product_unit, product_quantity, threshold, product_image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [product_id, product_name, product_type, product_unit, product_quantity, threshold, product_image],
    (error) => {
      if (error) {
        console.error('Database insertion error:', error);
        return res.status(500).json({ error: 'Failed to add product' });
      }
      res.status(201).json({ message: 'Product added successfully', product_id });
    }
  );
});

module.exports = router;

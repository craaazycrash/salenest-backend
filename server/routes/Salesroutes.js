const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');

// ✅ CREATE NEW SALE
router.post('/sales', async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    if (!paymentMethod || !['Cash', 'UPI'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Create sale
    const newSale = new Sale({
      items,
      totalAmount,
      paymentMethod,
      date: new Date()
    });

    const savedSale = await newSale.save();
    
    res.status(201).json(savedSale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
});

// ✅ GET ALL SALES
router.get('/sales', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 }); // Most recent first
    res.status(200).json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// ✅ GET TODAY'S SALES
router.get('/sales/today', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySales = await Sale.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ date: -1 });

    const totalRevenue = todaySales.reduce(
      (sum, sale) => sum + sale.totalAmount, 
      0
    );

    res.status(200).json({
      sales: todaySales,
      totalRevenue,
      count: todaySales.length
    });
  } catch (error) {
    console.error('Error fetching today sales:', error);
    res.status(500).json({ error: 'Failed to fetch today sales' });
  }
});

// ✅ GET SALE BY ID
router.get('/sales/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.status(200).json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

// ✅ GET SALES BY DATE RANGE (Optional - for advanced filtering)
router.get('/sales/range/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    const sales = await Sale.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + sale.totalAmount, 
      0
    );

    res.status(200).json({
      sales,
      totalRevenue,
      count: sales.length
    });
  } catch (error) {
    console.error('Error fetching sales by range:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

module.exports = router;
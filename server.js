const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ MONGODB CONNECTION
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/salenest';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// ✅ ITEM/PRODUCT SCHEMA
const ItemSchema = new mongoose.Schema({
  itemImage: String,
  itemName: String,
  itemPrice: Number
});

const Item = mongoose.model('Item', ItemSchema);

// ✅ SALES SCHEMA
const SaleSchema = new mongoose.Schema({
  items: [{
    _id: String,
    itemName: String,
    itemPrice: Number,
    itemImage: String,
    quantity: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'UPI']
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Sale = mongoose.model('Sale', SaleSchema);

// ✅ TEST ROUTE
app.get('/', (req, res) => {
  res.send('SaleNest Backend API is running! ✅');
});

// ✅ PRODUCT/ITEM ROUTES
app.post('/pushing', async (req, res) => {
  try {
    const { itemImage, itemName, itemPrice } = req.body;
    
    if (!itemName || !itemPrice) {
      return res.status(400).send('Item name and price are required');
    }

    const newItem = new Item({ itemImage, itemName, itemPrice });
    await newItem.save();
    res.status(201).send('Item added successfully');
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).send('Error adding item');
  }
});

app.get('/getting', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Error fetching items');
  }
});

app.put('/updating/:id', async (req, res) => {
  try {
    const { itemImage, itemName, itemPrice } = req.body;
    await Item.findByIdAndUpdate(req.params.id, {
      itemImage,
      itemName,
      itemPrice
    });
    res.status(200).send('Item updated successfully');
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).send('Error updating item');
  }
});

app.delete('/deleting/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.status(200).send('Item deleted successfully');
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).send('Error deleting item');
  }
});

// ✅ SALES ROUTES

// CREATE NEW SALE
app.post('/sales', async (req, res) => {
  try {
    console.log('📥 Received sale request:', req.body);

    const { items, totalAmount, paymentMethod } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('❌ Validation error: Cart is empty');
      return res.status(400).json({ 
        error: 'Cart is empty',
        success: false 
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      console.error('❌ Validation error: Invalid total amount');
      return res.status(400).json({ 
        error: 'Invalid total amount',
        success: false 
      });
    }

    if (!paymentMethod || !['Cash', 'UPI'].includes(paymentMethod)) {
      console.error('❌ Validation error: Invalid payment method');
      return res.status(400).json({ 
        error: 'Invalid payment method. Must be Cash or UPI',
        success: false 
      });
    }

    // Create sale
    const newSale = new Sale({
      items,
      totalAmount,
      paymentMethod,
      date: new Date()
    });

    const savedSale = await newSale.save();
    
    console.log('✅ Sale saved successfully:', savedSale._id);
    
    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      ...savedSale.toObject()
    });
  } catch (error) {
    console.error('❌ Error creating sale:', error);
    res.status(500).json({ 
      error: 'Failed to create sale',
      details: error.message,
      success: false 
    });
  }
});

// GET ALL SALES
app.get('/sales', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 });
    console.log(`📊 Fetched ${sales.length} sales`);
    res.status(200).json(sales);
  } catch (error) {
    console.error('❌ Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// GET TODAY'S SALES
app.get('/sales/today', async (req, res) => {
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

    console.log(`📊 Today's sales: ${todaySales.length} transactions, ₹${totalRevenue} revenue`);

    res.status(200).json({
      sales: todaySales,
      totalRevenue,
      count: todaySales.length
    });
  } catch (error) {
    console.error('❌ Error fetching today sales:', error);
    res.status(500).json({ error: 'Failed to fetch today sales' });
  }
});

// GET SALE BY ID
app.get('/sales/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.status(200).json(sale);
  } catch (error) {
    console.error('❌ Error fetching sale:', error);
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

// ✅ ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// ✅ 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 SaleNest Backend Server Started!');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📦 Database: ${MONGO_URI}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

module.exports = app;
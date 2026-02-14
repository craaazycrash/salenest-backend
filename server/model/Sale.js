const mongoose = require('mongoose');

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

module.exports = mongoose.model('Sale', SaleSchema);
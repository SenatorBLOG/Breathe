// models/SupportTicket.js
const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, maxlength: 100 },
  email:    { type: String, required: true, trim: true, maxlength: 200 },
  category: { type: String, enum: ['bug', 'question', 'feedback', 'account', 'other'], default: 'other' },
  message:  { type: String, required: true, trim: true, maxlength: 1000 },
  resolved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
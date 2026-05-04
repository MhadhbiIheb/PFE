const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema({
  nom: String,
  type: String,
  adresse: String,
  ville: String,
  telephone: String,
  email: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Salon', salonSchema);
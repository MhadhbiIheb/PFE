const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' },
  nom: String,
  prix: Number,
  duree: Number,
  categorie: String,
  actif: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
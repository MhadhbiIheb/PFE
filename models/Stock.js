const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' },
  nom: String,
  quantite: Number,
  seuilAlerte: Number,
  prixAchat: Number,
  prixVente: Number
}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);
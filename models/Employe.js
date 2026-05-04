const mongoose = require('mongoose');

const employeSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' },
  nom: String,
  prenom: String,
  specialite: String,
  tauxCommission: Number,
  statut: { type: String, default: 'actif' }
}, { timestamps: true });

module.exports = mongoose.model('Employe', employeSchema);
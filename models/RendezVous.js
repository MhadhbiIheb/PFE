const mongoose = require('mongoose');

const rdvSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employe' },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  date: Date,
  heureDebut: String,
  statut: { type: String, default: 'en_attente' },
  prix: Number,
  duree: Number
}, { timestamps: true });

module.exports = mongoose.model('RendezVous', rdvSchema);
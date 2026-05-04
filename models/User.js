const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  email: { type: String, unique: true },
  password: String,
  telephone: String,
  role: { type: String, enum: ['owner', 'client', 'employe'], default: 'client' },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' },
  pointsFidelite: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
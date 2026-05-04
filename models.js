// ══════════════════════════════════════════
//   LUMIERA — MongoDB Models
//   File: server/models.js
// ══════════════════════════════════════════

const mongoose = require('mongoose');

// ── USER MODEL ─────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  nom:       { type: String, required: true },
  prenom:    { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  telephone: { type: String },
  role:      { type: String, enum: ['owner', 'client', 'employe'], default: 'client' },
  salonId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' },
  // Client loyalty
  pointsFidelite: { type: Number, default: 0 },
  niveauFidelite: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  actif:     { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// ── SALON / ETABLISSEMENT MODEL ────────────────────────────
const salonSchema = new mongoose.Schema({
  nom:        { type: String, required: true },
  type:       { type: String, enum: ['beauty', 'football', 'tennis', 'padel', 'sport', 'spa', 'other'], required: true },
  adresse:    { type: String, required: true },
  ville:      { type: String, required: true },
  telephone:  { type: String },
  email:      { type: String },
  description:{ type: String },
  ownerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Horaires
  horaires: {
    lundi:    { ouvert: Boolean, debut: String, fin: String },
    mardi:    { ouvert: Boolean, debut: String, fin: String },
    mercredi: { ouvert: Boolean, debut: String, fin: String },
    jeudi:    { ouvert: Boolean, debut: String, fin: String },
    vendredi: { ouvert: Boolean, debut: String, fin: String },
    samedi:   { ouvert: Boolean, debut: String, fin: String },
    dimanche: { ouvert: Boolean, debut: String, fin: String },
  },
  rating:    { type: Number, default: 0 },
  nbAvis:    { type: Number, default: 0 },
  actif:     { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// ── SERVICE MODEL ──────────────────────────────────────────
const serviceSchema = new mongoose.Schema({
  salonId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  nom:        { type: String, required: true },
  nomFr:      { type: String },
  description:{ type: String },
  prix:       { type: Number, required: true },
  duree:      { type: Number, required: true }, // en minutes
  categorie:  { type: String },
  actif:      { type: Boolean, default: true }
});

// ── EMPLOYEE MODEL ─────────────────────────────────────────
const employeSchema = new mongoose.Schema({
  salonId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nom:            { type: String, required: true },
  prenom:         { type: String, required: true },
  telephone:      { type: String },
  specialite:     { type: String },
  tauxCommission: { type: Number, default: 10 }, // %
  // Planning hebdomadaire
  planning: [{
    jour:   { type: String },
    debut:  { type: String },
    fin:    { type: String },
    actif:  { type: Boolean, default: true }
  }],
  statut:   { type: String, enum: ['actif', 'conge', 'absent'], default: 'actif' },
  createdAt:{ type: Date, default: Date.now }
});

// ── BOOKING (RENDEZ-VOUS) MODEL ────────────────────────────
const rdvSchema = new mongoose.Schema({
  salonId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  clientId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employe' },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  // Infos dénormalisées pour affichage rapide
  clientNom:    { type: String },
  employeNom:   { type: String },
  serviceNom:   { type: String },
  prix:         { type: Number },
  duree:        { type: Number },
  // Date et heure
  date:         { type: Date, required: true },
  heureDebut:   { type: String, required: true }, // "14:30"
  heureFin:     { type: String },
  // Statut
  statut: {
    type: String,
    enum: ['en_attente', 'confirme', 'annule', 'termine', 'absent'],
    default: 'en_attente'
  },
  notes:         { type: String },
  pointsGagnes:  { type: Number, default: 0 },
  createdAt:     { type: Date, default: Date.now }
});

// ── STOCK MODEL ─────────────────────────────────────────────
const stockSchema = new mongoose.Schema({
  salonId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  nom:           { type: String, required: true },
  reference:     { type: String },
  categorie:     { type: String },
  quantite:      { type: Number, required: true, default: 0 },
  seuilAlerte:   { type: Number, default: 5 },
  prixAchat:     { type: Number },
  prixVente:     { type: Number },
  unite:         { type: String, default: 'pcs' },
  fournisseur:   { type: String },
  createdAt:     { type: Date, default: Date.now },
  updatedAt:     { type: Date, default: Date.now }
});

// ── PAIEMENT MODEL ─────────────────────────────────────────
const paiementSchema = new mongoose.Schema({
  salonId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  rdvId:     { type: mongoose.Schema.Types.ObjectId, ref: 'RendezVous' },
  clientId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  montant:   { type: Number, required: true },
  methode:   { type: String, enum: ['cash', 'carte', 'digital'], default: 'cash' },
  statut:    { type: String, enum: ['paye', 'en_attente', 'rembourse'], default: 'paye' },
  notes:     { type: String },
  createdAt: { type: Date, default: Date.now }
});

// ── EXPORTS ─────────────────────────────────────────────────
module.exports = {
  User:       mongoose.model('User',       userSchema),
  Salon:      mongoose.model('Salon',      salonSchema),
  Service:    mongoose.model('Service',    serviceSchema),
  Employe:    mongoose.model('Employe',    employeSchema),
  RendezVous: mongoose.model('RendezVous', rdvSchema),
  Stock:      mongoose.model('Stock',      stockSchema),
  Paiement:   mongoose.model('Paiement',  paiementSchema),
};

// ══════════════════════════════════════════
//   LUMIERA — Main Server
//   File: server/index.js
//   Run: node server/index.js
// ══════════════════════════════════════════

require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const path       = require('path');
const routes     = require('./routes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── STATIC FILES (HTML pages) ──────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ── API ROUTES ─────────────────────────────────────────────
app.use('/api', routes);

// ── HTML PAGE ROUTES ───────────────────────────────────────
app.get('/',        (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/app',     (req, res) => res.sendFile(path.join(__dirname, '../public/app.html')));
app.get('/chatbot', (req, res) => res.sendFile(path.join(__dirname, '../public/chatbot.html')));

// ── MONGODB CONNECTION ─────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lumiera')
  .then(async () => {
    console.log('✅ MongoDB connecté — Base: lumiera');
    // Seed initial data si vide
    const { User } = require('./models');
    const adminExists = await User.findOne({ email: 'admin@lumiera.tn' });
    if (!adminExists) {
      await seedDatabase();
    }
  })
  .catch(err => {
    console.error('❌ Erreur MongoDB:', err.message);
    console.log('💡 Vérifiez que MongoDB est lancé: mongod --dbpath ./data');
  });

// ── SEED DATABASE ──────────────────────────────────────────
async function seedDatabase() {
  const bcrypt = require('bcryptjs');
  const { User, Salon, Service, Employe, Stock } = require('./models');

  console.log('🌱 Initialisation de la base de données...');

  // Créer owner demo
  const hashedPwd = await bcrypt.hash('demo1234', 10);
  const owner = new User({
    nom: 'Ben Ali', prenom: 'Amina',
    email: 'admin@lumiera.tn',
    password: hashedPwd,
    telephone: '+216 22 111 222',
    role: 'owner'
  });
  await owner.save();

  // Créer salon demo
  const salon = new Salon({
    nom: 'Salon Lumiera Demo',
    type: 'beauty',
    adresse: '12 Rue Lafayette',
    ville: 'Tunis',
    telephone: '+216 71 000 000',
    email: 'salon@lumiera.tn',
    ownerId: owner._id,
    rating: 4.9, nbAvis: 124
  });
  await salon.save();
  owner.salonId = salon._id;
  await owner.save();

  // Créer client demo
  const client = new User({
    nom: 'Marzougui', prenom: 'Sara',
    email: 'client@lumiera.tn',
    password: hashedPwd,
    telephone: '+216 25 333 444',
    role: 'client',
    pointsFidelite: 480,
    niveauFidelite: 'Gold'
  });
  await client.save();

  // Services
  const services = await Service.insertMany([
    { salonId: salon._id, nom: 'قص شعر', nomFr: 'Coupe', prix: 35, duree: 30, categorie: 'cheveux' },
    { salonId: salon._id, nom: 'قص وصبغ', nomFr: 'Coupe + Couleur', prix: 85, duree: 90, categorie: 'cheveux' },
    { salonId: salon._id, nom: 'تصفيف', nomFr: 'Brushing', prix: 25, duree: 30, categorie: 'cheveux' },
    { salonId: salon._id, nom: 'مانيكير', nomFr: 'Manucure', prix: 30, duree: 45, categorie: 'esthetique' },
    { salonId: salon._id, nom: 'باديكير', nomFr: 'Pédicure', prix: 35, duree: 50, categorie: 'esthetique' },
    { salonId: salon._id, nom: 'تنظيف بشرة', nomFr: 'Soin visage', prix: 55, duree: 60, categorie: 'esthetique' },
  ]);

  // Employées
  await Employe.insertMany([
    { salonId: salon._id, nom: 'Zaidi', prenom: 'Fatma', specialite: 'Coiffeuse Senior', tauxCommission: 10, statut: 'actif' },
    { salonId: salon._id, nom: 'Ben Salem', prenom: 'Rim', specialite: 'Esthéticienne', tauxCommission: 10, statut: 'actif' },
    { salonId: salon._id, nom: 'Khmiri', prenom: 'Salma', specialite: 'Manucure', tauxCommission: 8, statut: 'conge' },
  ]);

  // Stock
  await Stock.insertMany([
    { salonId: salon._id, nom: 'Shampoo L\'Oréal', quantite: 18, seuilAlerte: 5, prixAchat: 25, prixVente: 45, categorie: 'soins' },
    { salonId: salon._id, nom: 'Vernis OPI', quantite: 4, seuilAlerte: 10, prixAchat: 15, prixVente: 30, categorie: 'manucure' },
    { salonId: salon._id, nom: 'Crème Soin Visage', quantite: 25, seuilAlerte: 8, prixAchat: 30, prixVente: 60, categorie: 'soin' },
    { salonId: salon._id, nom: 'Teinture Wella', quantite: 2, seuilAlerte: 5, prixAchat: 20, prixVente: 0, categorie: 'coloration' },
  ]);

  console.log('✅ Base initialisée avec données demo');
  console.log('   Owner:  admin@lumiera.tn / demo1234');
  console.log('   Client: client@lumiera.tn / demo1234');
}

// ── ERROR HANDLER ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// ── START SERVER ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║        LUMIERA SERVER STARTED         ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  App:     http://localhost:${PORT}       ║`);
  console.log(`║  API:     http://localhost:${PORT}/api   ║`);
  console.log(`║  MongoDB: ${process.env.MONGODB_URI?.slice(0,28)}...  ║`);
  console.log('╚══════════════════════════════════════╝');
  console.log('');
});

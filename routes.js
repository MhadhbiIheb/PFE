// ══════════════════════════════════════════
//   LUMIERA — API Routes
//   File: server/routes.js
// ══════════════════════════════════════════

const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { User, Salon, Service, Employe, RendezVous, Stock, Paiement } = require('./models');

const JWT_SECRET = process.env.JWT_SECRET || 'lumiera_secret';

// ── MIDDLEWARE AUTH ────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

// ═══════════════════════════════════════════════════════════
//   AUTH ROUTES
// ═══════════════════════════════════════════════════════════

// POST /api/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { nom, prenom, email, password, telephone, role, nomSalon, ville } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email déjà utilisé' });

    const hashedPwd = await bcrypt.hash(password, 10);
    const user = new User({ nom, prenom, email, password: hashedPwd, telephone, role: role || 'client' });

    // Si owner, créer le salon
    if (role === 'owner' && nomSalon) {
      const salon = new Salon({
        nom: nomSalon,
        type: 'beauty',
        adresse: '',
        ville: ville || 'Tunis',
        ownerId: user._id
      });
      await salon.save();
      user.salonId = salon._id;
    }

    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role, salonId: user.salonId }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, nom, prenom, email, role: user.role, salonId: user.salonId }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Email ou mot de passe incorrect' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Email ou mot de passe incorrect' });

    const token = jwt.sign({ id: user._id, role: user.role, salonId: user.salonId }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, salonId: user.salonId, pointsFidelite: user.pointsFidelite }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/auth/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// ═══════════════════════════════════════════════════════════
//   RENDEZ-VOUS ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/rdv — tous les RDV du salon
router.get('/rdv', authMiddleware, async (req, res) => {
  try {
    const { date, statut, clientId } = req.query;
    const filter = { salonId: req.user.salonId };
    if (date) {
      const d = new Date(date);
      filter.date = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
    }
    if (statut) filter.statut = statut;
    if (clientId) filter.clientId = clientId;

    const rdvs = await RendezVous.find(filter).sort({ date: 1, heureDebut: 1 });
    res.json(rdvs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/rdv/client — RDV du client connecté
router.get('/rdv/client', authMiddleware, async (req, res) => {
  try {
    const rdvs = await RendezVous.find({ clientId: req.user.id }).sort({ date: -1 });
    res.json(rdvs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/rdv — créer un RDV
router.post('/rdv', authMiddleware, async (req, res) => {
  try {
    const { salonId, serviceId, employeId, date, heureDebut, notes } = req.body;

    // Récupérer infos service
    const service = await Service.findById(serviceId);
    const employe = employeId ? await Employe.findById(employeId) : null;
    const client  = await User.findById(req.user.id);

    const rdv = new RendezVous({
      salonId:    salonId || req.user.salonId,
      clientId:   req.user.id,
      employeId,
      serviceId,
      clientNom:  `${client.prenom} ${client.nom}`,
      employeNom: employe ? `${employe.prenom} ${employe.nom}` : '',
      serviceNom: service?.nom || '',
      prix:       service?.prix || 0,
      duree:      service?.duree || 60,
      date:       new Date(date),
      heureDebut,
      notes,
      pointsGagnes: service ? Math.floor(service.prix) : 0,
    });

    await rdv.save();
    res.status(201).json(rdv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/rdv/:id/statut — changer statut
router.patch('/rdv/:id/statut', authMiddleware, async (req, res) => {
  try {
    const rdv = await RendezVous.findByIdAndUpdate(
      req.params.id,
      { statut: req.body.statut },
      { new: true }
    );
    // Si terminé → ajouter points fidélité au client
    if (req.body.statut === 'termine' && rdv.clientId) {
      await User.findByIdAndUpdate(rdv.clientId, { $inc: { pointsFidelite: rdv.pointsGagnes } });
    }
    res.json(rdv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/rdv/:id — annuler RDV
router.delete('/rdv/:id', authMiddleware, async (req, res) => {
  try {
    await RendezVous.findByIdAndUpdate(req.params.id, { statut: 'annule' });
    res.json({ message: 'RDV annulé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════
//   CLIENTS ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/clients
router.get('/clients', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { role: 'client' };
    if (search) filter.$or = [
      { nom: { $regex: search, $options: 'i' } },
      { prenom: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const clients = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/clients/:id
router.get('/clients/:id', authMiddleware, async (req, res) => {
  try {
    const client = await User.findById(req.params.id).select('-password');
    const rdvs   = await RendezVous.find({ clientId: req.params.id }).sort({ date: -1 }).limit(10);
    res.json({ client, rdvs });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════
//   EMPLOYES ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/employes
router.get('/employes', authMiddleware, async (req, res) => {
  try {
    const employes = await Employe.find({ salonId: req.user.salonId });
    res.json(employes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/employes
router.post('/employes', authMiddleware, async (req, res) => {
  try {
    const employe = new Employe({ ...req.body, salonId: req.user.salonId });
    await employe.save();
    res.status(201).json(employe);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/employes/:id
router.patch('/employes/:id', authMiddleware, async (req, res) => {
  try {
    const emp = await Employe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(emp);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/employes/:id
router.delete('/employes/:id', authMiddleware, async (req, res) => {
  try {
    await Employe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employé supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════
//   SERVICES ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/services
router.get('/services', authMiddleware, async (req, res) => {
  try {
    const salonId = req.query.salonId || req.user.salonId;
    const services = await Service.find({ salonId, actif: true });
    res.json(services);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/services
router.post('/services', authMiddleware, async (req, res) => {
  try {
    const service = new Service({ ...req.body, salonId: req.user.salonId });
    await service.save();
    res.status(201).json(service);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/services/:id
router.patch('/services/:id', authMiddleware, async (req, res) => {
  try {
    const s = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════
//   STOCK ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/stock
router.get('/stock', authMiddleware, async (req, res) => {
  try {
    const stock = await Stock.find({ salonId: req.user.salonId }).sort({ nom: 1 });
    res.json(stock);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/stock/alertes — produits sous le seuil
router.get('/stock/alertes', authMiddleware, async (req, res) => {
  try {
    const alertes = await Stock.find({
      salonId: req.user.salonId,
      $expr: { $lte: ['$quantite', '$seuilAlerte'] }
    });
    res.json(alertes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/stock
router.post('/stock', authMiddleware, async (req, res) => {
  try {
    const item = new Stock({ ...req.body, salonId: req.user.salonId });
    await item.save();
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/stock/:id
router.patch('/stock/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Stock.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/stock/:id
router.delete('/stock/:id', authMiddleware, async (req, res) => {
  try {
    await Stock.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produit supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════
//   PAIEMENTS / POS ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/paiements
router.get('/paiements', authMiddleware, async (req, res) => {
  try {
    const { debut, fin } = req.query;
    const filter = { salonId: req.user.salonId };
    if (debut && fin) filter.createdAt = { $gte: new Date(debut), $lte: new Date(fin) };
    const paiements = await Paiement.find(filter).sort({ createdAt: -1 });
    res.json(paiements);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/paiements
router.post('/paiements', authMiddleware, async (req, res) => {
  try {
    const p = new Paiement({ ...req.body, salonId: req.user.salonId });
    await p.save();
    res.status(201).json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════
//   RAPPORTS ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/rapports/dashboard — KPIs du jour
router.get('/rapports/dashboard', authMiddleware, async (req, res) => {
  try {
    const salonId = req.user.salonId;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0,0,0,0));
    const endOfDay   = new Date(today.setHours(23,59,59,999));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [rdvsAujourdhui, rdvsConfirmes, paiementsJour, paiementsMois, nbClients, alertesStock] = await Promise.all([
      RendezVous.countDocuments({ salonId, date: { $gte: startOfDay, $lte: endOfDay } }),
      RendezVous.countDocuments({ salonId, date: { $gte: startOfDay, $lte: endOfDay }, statut: 'confirme' }),
      Paiement.aggregate([
        { $match: { salonId: salonId ? require('mongoose').Types.ObjectId.createFromHexString(salonId.toString()) : null, createdAt: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, total: { $sum: '$montant' } } }
      ]),
      Paiement.aggregate([
        { $match: { salonId: salonId ? require('mongoose').Types.ObjectId.createFromHexString(salonId.toString()) : null, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$montant' } } }
      ]),
      User.countDocuments({ role: 'client', actif: true }),
      Stock.countDocuments({ salonId, $expr: { $lte: ['$quantite', '$seuilAlerte'] } })
    ]);

    res.json({
      rdvsAujourdhui,
      rdvsConfirmes,
      revenusJour:  paiementsJour[0]?.total  || 0,
      revenusMois:  paiementsMois[0]?.total   || 0,
      nbClients,
      alertesStock
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/rapports/revenus — revenus par période
router.get('/rapports/revenus', authMiddleware, async (req, res) => {
  try {
    const { periode } = req.query; // 'semaine', 'mois', 'annee'
    const salonId = req.user.salonId;
    const now = new Date();
    let debut;

    if (periode === 'semaine') {
      debut = new Date(now); debut.setDate(debut.getDate() - 7);
    } else if (periode === 'mois') {
      debut = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      debut = new Date(now.getFullYear(), 0, 1);
    }

    const revenus = await Paiement.aggregate([
      { $match: { salonId: salonId ? require('mongoose').Types.ObjectId.createFromHexString(salonId.toString()) : null, createdAt: { $gte: debut } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: '$montant' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ]);

    res.json(revenus);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════
//   SALON ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/salon — infos du salon de l'owner connecté
router.get('/salon', authMiddleware, async (req, res) => {
  try {
    const salon = await Salon.findById(req.user.salonId);
    res.json(salon);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/salon — modifier infos salon
router.patch('/salon', authMiddleware, async (req, res) => {
  try {
    const salon = await Salon.findByIdAndUpdate(req.user.salonId, req.body, { new: true });
    res.json(salon);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/salons — tous les salons (public, pour la home)
router.get('/salons', async (req, res) => {
  try {
    const { type, ville, search } = req.query;
    const filter = { actif: true };
    if (type)   filter.type = type;
    if (ville)  filter.ville = { $regex: ville, $options: 'i' };
    if (search) filter.nom  = { $regex: search, $options: 'i' };
    const salons = await Salon.find(filter).select('-__v').limit(50);
    res.json(salons);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

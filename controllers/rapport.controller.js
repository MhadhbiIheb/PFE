const RDV = require('../models/RendezVous');
const Paiement = require('../models/Paiement');
const User = require('../models/User');
const Stock = require('../models/Stock');

exports.dashboard = async (req, res) => {
  const salonId = req.user.salonId;

  const rdvs = await RDV.countDocuments({ salonId });
  const clients = await User.countDocuments({ role: 'client' });

  const revenus = await Paiement.aggregate([
    { $match: { salonId } },
    { $group: { _id: null, total: { $sum: '$montant' } } }
  ]);

  const stockAlerts = await Stock.countDocuments({
    salonId,
    $expr: { $lte: ['$quantite', '$seuilAlerte'] }
  });

  res.json({
    rdvs,
    clients,
    revenus: revenus[0]?.total || 0,
    stockAlerts
  });
};

exports.revenus = async (req, res) => {
  const data = await Paiement.aggregate([
    { $match: { salonId: req.user.salonId } },
    {
      $group: {
        _id: { $month: '$createdAt' },
        total: { $sum: '$montant' }
      }
    }
  ]);

  res.json(data);
};

exports.clientsStats = async (req, res) => {
  const clients = await User.find({ role: 'client' });
  res.json({ total: clients.length });
};
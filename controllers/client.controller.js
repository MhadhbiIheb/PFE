const User = require('../models/User');
const RDV = require('../models/RendezVous');

exports.getAllClients = async (req, res) => {
  const clients = await User.find({ role: 'client' });
  res.json(clients);
};

exports.getClientDetails = async (req, res) => {
  const client = await User.findById(req.params.id);
  const rdvs = await RDV.find({ clientId: req.params.id });

  res.json({ client, rdvs });
};

exports.updatePoints = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { pointsFidelite: req.body.points },
    { new: true }
  );

  res.json(user);
};
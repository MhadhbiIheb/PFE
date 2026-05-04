const RDV = require('../models/RendezVous');

exports.getAll = async (req, res) => {
  const data = await RDV.find({ salonId: req.user.salonId })
    .sort({ date: 1 });
  res.json(data);
};

exports.create = async (req, res) => {
  const rdv = await RDV.create({
    ...req.body,
    clientId: req.user.id,
    salonId: req.user.salonId
  });

  res.status(201).json(rdv);
};

exports.updateStatus = async (req, res) => {
  const rdv = await RDV.findByIdAndUpdate(
    req.params.id,
    { statut: req.body.statut },
    { new: true }
  );

  res.json(rdv);
};

exports.deleteRdv = async (req, res) => {
  await RDV.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};
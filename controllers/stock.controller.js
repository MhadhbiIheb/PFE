const Stock = require('../models/Stock');

exports.getAll = async (req, res) => {
  const data = await Stock.find({ salonId: req.user.salonId });
  res.json(data);
};

exports.getAlerts = async (req, res) => {
  const data = await Stock.find({
    salonId: req.user.salonId,
    $expr: { $lte: ['$quantite', '$seuilAlerte'] }
  });

  res.json(data);
};

exports.create = async (req, res) => {
  const item = await Stock.create({
    ...req.body,
    salonId: req.user.salonId
  });

  res.status(201).json(item);
};

exports.update = async (req, res) => {
  const item = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
};

exports.remove = async (req, res) => {
  await Stock.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};
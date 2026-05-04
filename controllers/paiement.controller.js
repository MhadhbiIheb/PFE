const Paiement = require('../models/Paiement');

exports.getAll = async (req, res) => {
  const data = await Paiement.find({ salonId: req.user.salonId });
  res.json(data);
};

exports.create = async (req, res) => {
  const pay = await Paiement.create({
    ...req.body,
    salonId: req.user.salonId
  });

  res.status(201).json(pay);
};
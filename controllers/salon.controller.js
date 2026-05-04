const Salon = require('../models/Salon');

exports.getMySalon = async (req, res) => {
  const salon = await Salon.findById(req.user.salonId);
  res.json(salon);
};

exports.updateSalon = async (req, res) => {
  const salon = await Salon.findByIdAndUpdate(
    req.user.salonId,
    req.body,
    { new: true }
  );

  res.json(salon);
};

exports.getAllSalons = async (req, res) => {
  const salons = await Salon.find();
  res.json(salons);
};
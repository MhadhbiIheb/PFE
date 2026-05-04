const Service = require('../models/Services');

exports.getAll = async (req, res) => {
  const data = await Service.find({ salonId: req.user.salonId });
  res.json(data);
};

exports.create = async (req, res) => {
  const service = await Service.create({
    ...req.body,
    salonId: req.user.salonId
  });

  res.status(201).json(service);
};

exports.update = async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(service);
};

exports.remove = async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};
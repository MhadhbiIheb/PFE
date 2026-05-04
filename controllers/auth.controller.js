const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const exist = await User.findOne({ email: req.body.email });
    if (exist) return res.status(400).json({ message: 'Email exists' });

    const hash = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      ...req.body,
      password: hash
    });

    res.json(user);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ message: 'Not found' });

    const ok = await bcrypt.compare(req.body.password, user.password);
    if (!ok) return res.status(400).json({ message: 'Wrong password' });

    const token = jwt.sign(
      { id: user._id, role: user.role, salonId: user.salonId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.me = (req, res) => {
  res.json(req.user);
};
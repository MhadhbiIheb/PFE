const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const c = require('../controllers/salon.controller');

// public
router.get('/public', c.getAllSalons);

// private (owner)
router.use(auth);

router.get('/', c.getMySalon);
router.patch('/', c.updateSalon);

module.exports = router;
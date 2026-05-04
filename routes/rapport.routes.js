const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const c = require('../controllers/rapport.controller');

router.use(auth);

// dashboard KPIs
router.get('/dashboard', c.dashboard);

// revenus
router.get('/revenus', c.revenus);

// analytics clients
router.get('/clients', c.clientsStats);

module.exports = router;
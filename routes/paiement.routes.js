const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const c = require('../controllers/paiement.controller');

router.use(auth);

router.get('/', c.getAll);
router.post('/', c.create);

module.exports = router;
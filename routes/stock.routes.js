const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const c = require('../controllers/stock.controller');

router.use(auth);

router.get('/', c.getAll);
router.get('/alerts', c.getAlerts);
router.post('/', c.create);
router.patch('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
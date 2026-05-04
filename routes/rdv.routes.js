const router = require('express').Router();
const c = require('../controllers/rdv.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);

// Get all RDV (salon)
router.get('/', c.getAll);

// Create RDV
router.post('/', c.create);

// Update status (confirm / cancel / done)
router.patch('/:id', c.updateStatus);

// Delete / cancel RDV
router.delete('/:id', c.deleteRdv);

module.exports = router;
const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const c = require('../controllers/client.controller');

router.use(auth);

// Get all clients
router.get('/', c.getAllClients);

// Get single client + history
router.get('/:id', c.getClientDetails);

// Update client loyalty points
router.patch('/:id/points', c.updatePoints);

module.exports = router;
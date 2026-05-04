const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const rdvRoutes = require('./routes/rdv.routes');
const clientRoutes = require('./routes/client.routes');
const employeRoutes = require('./routes/employe.routes');
const serviceRoutes = require('./routes/service.routes');
const stockRoutes = require('./routes/stock.routes');
const paiementRoutes = require('./routes/paiement.routes');
const salonRoutes = require('./routes/salon.routes');
const rapportRoutes = require('./routes/rapport.routes');

const app = express();

// ─────────────────────────────
// MIDDLEWARE
// ─────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// ─────────────────────────────
// API ROUTES
// ─────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/rdv', rdvRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/employes', employeRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/salon', salonRoutes);
app.use('/api/rapports', rapportRoutes);


// ─────────────────────────────
// HEALTH CHECK
// ─────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🚀 LUMIERA API is running',
    status: 'OK'
  });
});

// ─────────────────────────────
// ERROR HANDLER
// ─────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 SERVER ERROR:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

// ─────────────────────────────
// START SERVER (THIS WAS MISSING)
// ─────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════╗');
  console.log('║      LUMIERA BACKEND         ║');
  console.log('╠══════════════════════════════╣');
  console.log(`║  🚀 Running on port ${PORT}      ║`);
  console.log(`║  🌐 http://localhost:${PORT}     ║`);
  console.log('╚══════════════════════════════╝');
  console.log('');
});
const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    method: {
        type: String,
        enum: ['credit_card', 'paypal', 'bank_transfer'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const Paiement = mongoose.model('Paiement', paiementSchema);

module.exports = Paiement;
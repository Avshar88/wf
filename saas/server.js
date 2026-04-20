require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Stripe webhook needs raw body — mount before json parser
app.use('/api/payment/webhook', require('./routes/payment').stack
  ? express.Router()
  : (req, res, next) => next()
);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/config',   require('./routes/config'));
app.use('/api/workflow', require('./routes/workflow'));
app.use('/api/payment',  require('./routes/payment'));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

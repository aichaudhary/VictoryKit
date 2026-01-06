const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4047;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'GDPR Compliance', port: PORT });
});

// Main routes
app.use('/api/v1/gdprcompliance', require('./routes'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gdprcompliance_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected to gdprcompliance_db'))
  .catch(err => console.error('MongoDB error:', err));

app.listen(PORT, () => {
  console.log(`GDPR Compliance API running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

connectDB();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', async (req, res) => {
  try {
    return res.status(200).json({ message: 'VerifyVault server is running' });
  } catch (error) {
    return res.status(500).json({ message: 'Server health check failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/verify', require('./routes/verifyRoutes'));
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  if (err && err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }

    return res.status(400).json({ message: err.message || 'File upload error' });
  }

  if (err) {
    return res.status(400).json({ message: err.message || 'Request failed' });
  }

  return next();
});

app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

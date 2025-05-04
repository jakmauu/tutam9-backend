const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  // Update CORS untuk mengizinkan frontend Vercel
  origin: [ 'https://tutam9-frontend-gray.vercel.app/', '*'],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB (Tutam9 database)
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'Tutam9' // Menentukan nama database yang akan digunakan
})
  .then(() => console.log('Connected to Tutam9 database!'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Import routes
const assignmentRoutes = require('./routes/assignmentroutes');
const userRoutes = require('./routes/userroutes');

// Routes
app.get('/', (req, res) => {
  res.send('Assignment Tracker API is running');
});

// Use routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
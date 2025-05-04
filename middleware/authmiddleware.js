const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Get token dari header
  const token = req.header('x-auth-token');
  
  // Cek apakah token tersedia
  if (!token) {
    return res.status(401).json({ message: 'Tidak ada token, akses ditolak' });
  }
  
  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'assignment_tracker_secret');
    
    // Tambahkan user ID ke request object
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};

module.exports = auth;
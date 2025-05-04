const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User dengan email ini sudah terdaftar' });
    }

    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'assignment_tracker_secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      userId: user._id,
      username: user.username
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Mencoba login untuk pengguna: ${username}`);

    // Cek apakah pengguna ada
    const user = await User.findOne({ username });
    if (!user) {
      console.log('Pengguna tidak ditemukan');
      return res.status(400).json({ message: 'Username atau password tidak valid' });
    }

    // Cek password
    console.log('Membandingkan password...');
    const isMatch = await user.comparePassword(password);
    console.log('Hasil pencocokan password:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Username atau password tidak valid' });
    }

    // Generate token JWT dengan logging yang lebih baik
    const tokenPayload = { userId: user._id };
    const secret = process.env.JWT_SECRET || 'assignment_tracker_secret_key';
    console.log('Membuat token dengan panjang secret:', secret.length);
    
    const token = jwt.sign(tokenPayload, secret, { expiresIn: '1d' });
    console.log('Token berhasil dibuat');

    res.json({
      message: 'Login berhasil',
      token,
      userId: user._id,
      username: user.username
    });
  } catch (err) {
    console.error('Detail error login:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Hanya menampilkan username dan email, tanpa password
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
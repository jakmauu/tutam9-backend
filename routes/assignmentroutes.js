const express = require('express');
const router = express.Router();
const Assignment = require('../models/assignment');
const auth = require('../middleware/authmiddleware');

// Gunakan auth middleware untuk semua routes
router.use(auth);

// Get all assignments for the logged-in user
router.get('/', async (req, res) => {
  try {
    // Filter berdasarkan user ID dari token
    const assignments = await Assignment.find({ user: req.userId });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get assignments by day for the logged-in user
router.get('/day/:day', async (req, res) => {
  try {
    // Filter berdasarkan user ID dan day
    const assignments = await Assignment.find({ 
      user: req.userId,
      day: req.params.day 
    });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search assignments by title or subject only for the logged-in user
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter diperlukan' });
    }
    
    const assignments = await Assignment.find({
      user: req.userId, // Filter berdasarkan user ID
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { subject: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });
    
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single assignment (pastikan hanya owner yang bisa akses)
router.get('/:id', getAssignment, (req, res) => {
  res.json(res.assignment);
});

// Create an assignment
router.post('/', async (req, res) => {
  const assignment = new Assignment({
    title: req.body.title,
    description: req.body.description,
    subject: req.body.subject,
    day: req.body.day,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    isCompleted: req.body.isCompleted,
    user: req.userId // dari auth middleware
  });

  try {
    const newAssignment = await assignment.save();
    res.status(201).json(newAssignment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an assignment (hanya owner yang bisa update)
router.patch('/:id', getAssignment, async (req, res) => {
  // Pastikan yang edit adalah owner
  if (res.assignment.user.toString() !== req.userId) {
    return res.status(403).json({ message: 'Anda tidak berwenang mengubah assignment ini' });
  }

  if (req.body.title != null) {
    res.assignment.title = req.body.title;
  }
  if (req.body.description != null) {
    res.assignment.description = req.body.description;
  }
  if (req.body.subject != null) {
    res.assignment.subject = req.body.subject;
  }
  if (req.body.day != null) {
    res.assignment.day = req.body.day;
  }
  if (req.body.startTime != null) {
    res.assignment.startTime = req.body.startTime;
  }
  if (req.body.endTime != null) {
    res.assignment.endTime = req.body.endTime;
  }
  if (req.body.isCompleted != null) {
    res.assignment.isCompleted = req.body.isCompleted;
  }

  try {
    const updatedAssignment = await res.assignment.save();
    res.json(updatedAssignment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an assignment (hanya owner yang bisa delete)
router.delete('/:id', getAssignment, async (req, res) => {
  // Pastikan yang delete adalah owner
  if (res.assignment.user.toString() !== req.userId) {
    return res.status(403).json({ message: 'Anda tidak berwenang menghapus assignment ini' });
  }

  try {
    await res.assignment.deleteOne();
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to get assignment by ID and verify ownership
async function getAssignment(req, res, next) {
  let assignment;
  try {
    assignment = await Assignment.findById(req.params.id);
    if (assignment == null) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Tambahan verifikasi pemilik assignment
    if (assignment.user.toString() !== req.userId) {
      return res.status(403).json({ 
        message: 'Anda tidak berwenang mengakses assignment ini' 
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.assignment = assignment;
  next();
}

module.exports = router;
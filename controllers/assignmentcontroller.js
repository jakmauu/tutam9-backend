const Assignment = require('../models/assignment');

// Get assignments for current user
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ user: req.userId });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get assignments by day for current user
exports.getAssignmentsByDay = async (req, res) => {
  try {
    const assignments = await Assignment.find({ 
      user: req.userId,
      day: req.params.day 
    });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single assignment
exports.getAssignmentById = async (req, res) => {
  res.json(res.assignment);
};

// Create a new assignment
exports.createAssignment = async (req, res) => {
  const assignment = new Assignment({
    title: req.body.title,
    description: req.body.description,
    subject: req.body.subject,
    day: req.body.day,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    isCompleted: req.body.isCompleted
  });

  try {
    const newAssignment = await assignment.save();
    res.status(201).json(newAssignment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an assignment
exports.updateAssignment = async (req, res) => {
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
};

// Delete an assignment
exports.deleteAssignment = async (req, res) => {
  try {
    await res.assignment.deleteOne();
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Middleware to get assignment by ID
exports.getAssignment = async (req, res, next) => {
  let assignment;
  try {
    assignment = await Assignment.findById(req.params.id);
    if (assignment == null) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.assignment = assignment;
  next();
};
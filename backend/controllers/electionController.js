const Election = require('../models/Election');

// @desc    Get all elections
// @route   GET /api/elections
// @access  Public (or Private to voters/admins)
const getElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single election
// @route   GET /api/elections/:id
// @access  Public
const getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (election) {
      res.json(election);
    } else {
      res.status(404).json({ message: 'Election not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new election
// @route   POST /api/elections
// @access  Private/Admin
const createElection = async (req, res) => {
  const { title, description, startDate, endDate } = req.body;

  try {
    const election = new Election({
      title,
      description,
      startDate,
      endDate,
    });

    const createdElection = await election.save();
    res.status(201).json(createdElection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an election
// @route   PUT /api/elections/:id
// @access  Private/Admin
const updateElection = async (req, res) => {
  const { title, description, startDate, endDate } = req.body;

  try {
    const election = await Election.findById(req.params.id);

    if (election) {
      election.title = title || election.title;
      election.description = description || election.description;
      election.startDate = startDate || election.startDate;
      election.endDate = endDate || election.endDate;

      const updatedElection = await election.save();
      res.json(updatedElection);
    } else {
      res.status(404).json({ message: 'Election not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an election
// @route   DELETE /api/elections/:id
// @access  Private/Admin
const deleteElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (election) {
      await election.deleteOne();
      res.json({ message: 'Election removed' });
    } else {
      res.status(404).json({ message: 'Election not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection,
};

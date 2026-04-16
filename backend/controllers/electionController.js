const Election = require('../models/Election');

// @desc    Get all elections
// @route   GET /api/elections
// @access  Private
const getElections = async (req, res) => {
  try {
    let query = {};
    
    // If Admin, only show their own elections
    // If Voter, show all (or add voter-specific filtering if needed)
    if (req.user && req.user.role === 'admin') {
      query.createdBy = req.user._id;
    }

    const elections = await Election.find(query).sort({ createdAt: -1 });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single election
// @route   GET /api/elections/:id
// @access  Private
const getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Permission check for Admins
    if (req.user.role === 'admin' && election.createdBy && election.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this election' });
    }

    res.json(election);
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
      createdBy: req.user._id, // Set the owner
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

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Ownership check
    if (election.createdBy && election.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this election' });
    }

    election.title = title || election.title;
    election.description = description || election.description;
    election.startDate = startDate || election.startDate;
    election.endDate = endDate || election.endDate;

    const updatedElection = await election.save();
    res.json(updatedElection);
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

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Ownership check
    if (election.createdBy && election.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this election' });
    }

    await election.deleteOne();
    res.json({ message: 'Election removed' });
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

const Election = require('../models/Election');
const User = require('../models/User');

// @desc    Get all elections
// @route   GET /api/elections
// @access  Private
const getElections = async (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      // Admins only see their own elections
      const elections = await Election.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
      return res.json(elections);
    } else {
      // Voters: only show elections whose creator STILL EXISTS in the DB
      const validAdmins = await User.find({ role: 'admin' }).select('_id');
      const validAdminIds = validAdmins.map(u => u._id);
      const elections = await Election.find({ createdBy: { $in: validAdminIds } }).sort({ createdAt: -1 });
      return res.json(elections);
    }
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

// @desc    Cleanup orphaned elections (Delete elections with no valid owner)
// @route   GET /api/elections/rescue/now
// @access  Private/Admin
const cleanupOrphans = async (req, res) => {
  try {
    console.log('Starting Orphan Cleanup operation...');
    
    // Find all valid admin user IDs
    const validAdmins = await User.find({}).select('_id');
    const validAdminIds = validAdmins.map(u => u._id.toString());

    const elections = await Election.find();
    let removed = 0;

    for (const election of elections) {
      const hasValidOwner = election.createdBy && validAdminIds.includes(election.createdBy.toString());
      if (!hasValidOwner) {
        console.log(`Removing orphaned election: "${election.title}"`);
        await Election.deleteOne({ _id: election._id });
        removed++;
      }
    }

    res.json({ 
      message: `System Cleaned! Removed ${removed} orphaned elections.`,
      totalRemoved: removed
    });
  } catch (error) {
    console.error('Cleanup Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection,
  rescueElections: cleanupOrphans, // Keep name for route compatibility
};

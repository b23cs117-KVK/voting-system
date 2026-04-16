const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

// @desc    Get candidates for an election
// @route   GET /api/candidates/:electionId
// @access  Public
const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.electionId });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a candidate to an election
// @route   POST /api/candidates
// @access  Private/Admin
const addCandidate = async (req, res) => {
  const { name, description, electionId } = req.body;

  try {
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const candidate = new Candidate({
      name,
      description,
      election: electionId,
    });

    const createdCandidate = await candidate.save();
    res.status(201).json(createdCandidate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a candidate
// @route   DELETE /api/candidates/:id
// @access  Private/Admin
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (candidate) {
      await candidate.deleteOne();
      res.json({ message: 'Candidate removed' });
    } else {
      res.status(404).json({ message: 'Candidate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCandidates,
  addCandidate,
  deleteCandidate,
};

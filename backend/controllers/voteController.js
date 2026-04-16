const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const mongoose = require('mongoose');

// @desc    Cast a vote
// @route   POST /api/votes
// @access  Private
const castVote = async (req, res) => {
  const { electionId, candidateId } = req.body;

  try {
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (!election.isActive) {
      return res.status(400).json({ message: 'Election is not currently active' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate || candidate.election.toString() !== electionId) {
      return res.status(400).json({ message: 'Invalid candidate for this election' });
    }

    // Check if user already voted in this election
    const existingVote = await Vote.findOne({ user: req.user._id, election: electionId });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    const vote = new Vote({
      user: req.user._id,
      election: electionId,
      candidate: candidateId,
    });

    await vote.save();
    res.status(201).json({ message: 'Vote cast successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get results for an election
// @route   GET /api/votes/results/:electionId
// @access  Public (or Private based on requirements)
const getResults = async (req, res) => {
  try {
    const electionId = req.params.electionId;

    // Aggregate votes per candidate
    const results = await Vote.aggregate([
      { $match: { election: new mongoose.Types.ObjectId(electionId) } },
      { $group: { _id: '$candidate', count: { $sum: 1 } } }
    ]);

    const candidates = await Candidate.find({ election: electionId });

    // Format results with candidate details
    const formattedResults = candidates.map(candidate => {
      const voteResult = results.find(r => r._id.toString() === candidate._id.toString());
      return {
        candidate: candidate,
        votes: voteResult ? voteResult.count : 0
      };
    });

    const totalVotes = formattedResults.reduce((acc, curr) => acc + curr.votes, 0);

    res.json({
      electionId,
      totalVotes,
      results: formattedResults
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if user has voted
// @route   GET /api/votes/check/:electionId
// @access  Private
const checkHasVoted = async (req, res) => {
  try {
    const vote = await Vote.findOne({ user: req.user._id, election: req.params.electionId });
    res.json({ hasVoted: !!vote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  castVote,
  getResults,
  checkHasVoted,
};

const express = require('express');
const router = express.Router();
const { getElections, getElectionById, createElection, updateElection, deleteElection, rescueElections } = require('../controllers/electionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getElections)
  .post(protect, admin, createElection);

// Temporary rescue route (requires admin JWT)
router.get('/rescue/now', protect, admin, rescueElections);

// TEMP: Direct cleanup route (no auth, secret key guard) - REMOVE AFTER USE
router.get('/cleanup-secret-9x7z', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Election = mongoose.models.Election || require('../models/Election');
    const User = mongoose.models.User || require('../models/User');
    const Candidate = mongoose.models.Candidate || require('../models/Candidate');
    const Vote = mongoose.models.Vote || require('../models/Vote');

    const validUsers = await User.find({}).select('_id');
    const validIds = validUsers.map(u => u._id.toString());

    const elections = await Election.find();
    let removed = 0;
    for (const e of elections) {
      const isValid = e.createdBy && validIds.includes(e.createdBy.toString());
      if (!isValid) {
        await Vote.deleteMany({ election: e._id });
        await Candidate.deleteMany({ election: e._id });
        await Election.deleteOne({ _id: e._id });
        removed++;
        console.log(`Removed orphaned election: "${e.title}"`);
      }
    }
    res.json({ success: true, message: `Removed ${removed} orphaned elections.` });
  } catch (err) {
    console.error('Cleanup route error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.route('/:id')
  .get(protect, getElectionById)
  .put(protect, admin, updateElection)
  .delete(protect, admin, deleteElection);

module.exports = router;

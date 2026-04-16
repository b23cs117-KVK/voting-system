const express = require('express');
const router = express.Router();
const { getElections, getElectionById, createElection, updateElection, deleteElection, rescueElections } = require('../controllers/electionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getElections)
  .post(protect, admin, createElection);

// Temporary rescue route
router.get('/rescue/now', protect, admin, rescueElections);

router.route('/:id')
  .get(protect, getElectionById)
  .put(protect, admin, updateElection)
  .delete(protect, admin, deleteElection);

module.exports = router;

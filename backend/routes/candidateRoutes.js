const express = require('express');
const router = express.Router();
const { getCandidates, addCandidate, deleteCandidate } = require('../controllers/candidateController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, addCandidate);

router.route('/:electionId')
  .get(protect, getCandidates);

router.route('/:id')
  .delete(protect, admin, deleteCandidate);

module.exports = router;

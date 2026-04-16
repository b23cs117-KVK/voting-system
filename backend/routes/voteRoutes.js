const express = require('express');
const router = express.Router();
const { castVote, getResults, checkHasVoted } = require('../controllers/voteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, castVote);
router.get('/results/:electionId', getResults);
router.get('/check/:electionId', protect, checkHasVoted);

module.exports = router;

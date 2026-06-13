const express = require('express');
const router = express.Router();
const {
  createInterview,
  listInterviews,
  getInterview,
  submitAnswer,
  submitInterview,
  deleteInterview,
  getStats,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getStats);
router.route('/').post(createInterview).get(listInterviews);
router.route('/:id').get(getInterview).delete(deleteInterview);
router.post('/:id/submit-answer', submitAnswer);
router.post('/:id/submit', submitInterview);

module.exports = router;
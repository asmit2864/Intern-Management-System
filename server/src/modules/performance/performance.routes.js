const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth.middleware');
const {
    startInternship,
    getDashboardStats,
    syncJiraStats,
    submitWeeklyReview,
    getReviewsForCandidate,
    getMyReviews
} = require('./performance.controller');

// Manager routes
router.post('/start-internship', protect, authorize('manager', 'admin'), startInternship);
router.get('/dashboard', protect, authorize('manager', 'admin'), getDashboardStats);
router.post('/review', protect, authorize('manager', 'admin'), submitWeeklyReview);
router.get('/reviews/:candidateId', protect, authorize('manager', 'admin'), getReviewsForCandidate);

// Intern routes
router.get('/my-reviews', (req, res, next) => {
    console.log('DEBUG: Hit /my-reviews route (PerformanceRouter)');
    next();
}, protect, getMyReviews);

// Shared / Auto routes (Intern can verify their own stats)
router.post('/sync-jira/:id', protect, syncJiraStats);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');
const { bulkAssign, getMyTraining, markComplete, getAllTrainings, getTrainingByCandidate, uploadResource, deleteTraining } = require('./training.controller');

// Manager routes
router.post('/assign', protect, authorize('manager', 'admin'), bulkAssign);
router.post('/upload-resource', protect, authorize('manager', 'admin'), upload.single('file'), uploadResource);
router.get('/all', protect, authorize('manager', 'admin'), getAllTrainings);
router.get('/candidate/:candidateId', protect, authorize('manager', 'admin'), getTrainingByCandidate);
router.delete('/:id', protect, authorize('manager', 'admin'), deleteTraining);

// Intern routes
router.get('/my-learning', protect, getMyTraining);
router.patch('/:id/complete', protect, markComplete);

module.exports = router;

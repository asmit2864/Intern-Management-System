const express = require('express');
const candidateController = require('./candidate.controller');
const { protect } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');

const router = express.Router();

// All candidate routes are protected
router.use(protect);

/**
 * Story 2.1: Resume Upload Endpoint
 */
// Story 2.6: Batch Create Candidates
router.post('/batch', candidateController.createCandidates);
router.post('/upload', upload.single('resume'), candidateController.uploadResume);

/**
 * Story 3.1: Candidate List API
 */
router.get('/filters/colleges', candidateController.getUniqueColleges);
router.get('/stats', candidateController.getDashboardStats);
router.get('/', candidateController.getCandidates);
router.get('/:id', candidateController.getCandidateById);
router.patch('/:id', candidateController.updateCandidate);
router.delete('/:id', candidateController.deleteCandidate);
// Story 6.1: AI Chat Endpoint
router.post('/:id/chat', candidateController.handleCandidateChat);

// Story 9.1: Dynamic Rounds
router.post('/:id/rounds', candidateController.addRound);
router.patch('/:candidateId/rounds/:roundId', candidateController.updateRound);

module.exports = router;

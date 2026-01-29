const express = require('express');
const router = express.Router();
const boardingController = require('./boarding.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Secure Upload Configuration ---
const uploadDir = path.join(__dirname, '../../../../uploads/secure');
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (e) {
        console.error("Could not create secure upload dir", e);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Unique filename: candidateId-type-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- Manager Routes ---
router.post('/enable', protect, authorize('manager', 'admin'), boardingController.enableOnboarding);
router.patch('/verify/:documentId', protect, authorize('manager', 'admin'), boardingController.verifyDocument);
router.get('/candidate/:candidateId', protect, authorize('manager', 'admin'), boardingController.getCandidateDocuments);

// --- Intern Routes ---
router.get('/status', protect, authorize('intern', 'manager', 'admin'), boardingController.getMyOnboardingStatus);
router.post('/upload', protect, authorize('intern'), upload.single('file'), boardingController.uploadDocument);

// --- Shared Secure File Access ---
router.get('/file/:documentId', protect, authorize('manager', 'admin', 'intern'), boardingController.getDocumentFile);

module.exports = router;

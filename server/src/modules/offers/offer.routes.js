const express = require('express');
const router = express.Router();
const offerController = require('./offer.controller');

router.post('/preview', offerController.previewOffer);
router.post('/send', offerController.sendOffer);

module.exports = router;

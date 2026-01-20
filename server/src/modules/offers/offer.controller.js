const offerService = require('./offer.service');
const Candidate = require('../candidates/candidate.model');

const previewOffer = async (req, res) => {
    try {
        const { candidateName, offerDate, joiningDate, expiryDate } = req.body;

        if (!candidateName) {
            return res.status(400).json({ status: 'error', message: 'Candidate Name is required' });
        }

        const pdfBuffer = await offerService.generateOfferPDF({
            candidateName,
            offerDate: offerDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            joiningDate: joiningDate || 'To be Decided',
            expiryDate: expiryDate || 'Immediate'
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `inline; filename="Offer_${candidateName.replace(/\s+/g, '_')}.pdf"`
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error('Preview Error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to generate preview', error: error.message });
    }
};

const sendOffer = async (req, res) => {
    try {
        const { candidateId, offerDate, joiningDate, expiryDate } = req.body;

        if (!candidateId) {
            return res.status(400).json({ status: 'error', message: 'Candidate ID is required' });
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ status: 'error', message: 'Candidate not found' });
        }

        const pdfBuffer = await offerService.generateOfferPDF({
            candidateName: candidate.name,
            offerDate,
            joiningDate,
            expiryDate
        });

        // Use candidate email
        if (!candidate.email) {
            return res.status(400).json({ status: 'error', message: 'Candidate does not have an email address' });
        }

        const emailInfo = await offerService.sendOfferEmail(candidate.email, pdfBuffer, candidate.name);

        // Update Candidate Status
        candidate.status = 'Offer';
        candidate.offerSentAt = new Date();
        await candidate.save();

        res.json({
            status: 'success',
            message: 'Offer sent successfully',
            emailInfo
        });

    } catch (error) {
        console.error('Send Offer Error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to send offer', error: error.message });
    }
};

module.exports = {
    previewOffer,
    sendOffer
};

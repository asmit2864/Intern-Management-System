const fs = require('fs/promises');
const path = require('path');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

const generateOfferPDF = async (data) => {
    try {
        const templatePath = path.join(process.cwd(), 'src/templates/offerLetter.hbs');
        const templateHtml = await fs.readFile(templatePath, 'utf-8');

        // Compile Handlebars template
        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                bottom: '0px',
                left: '0px',
                right: '0px'
            }
        });

        await browser.close();

        return pdfBuffer;

    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    }
};

const sendOfferEmail = async (candidateEmail, pdfBuffer, candidateName) => {
    try {
        let transporter;

        // Check if environment variables for specific SMTP are set
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            console.log(`Sending email using configured SMTP host: ${process.env.SMTP_HOST}`);
        } else {
            // Fallback to Ethereal for testing
            console.log('No SMTP config found in .env, falling back to Ethereal test account.');
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Wissen HR" <hr@wissen.com>', // sender address
            to: candidateEmail, // list of receivers
            subject: "Offer of Employment - Wissen Technology", // Subject line
            text: `Dear ${candidateName},\n\nCongratulations! We are pleased to offer you the position of Trainee Analyst at Wissen Technology.\n\nPlease find the attached offer letter. Kindly sign and reply to this email by the expiry date.\n\nBest Regards,\nHR Team`, // plain text body
            attachments: [
                {
                    filename: 'OfferLetter.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });

        console.log("Message sent: %s", info.messageId);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("Preview URL: %s", previewUrl);
        return { messageId: info.messageId, previewUrl };

    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

module.exports = {
    generateOfferPDF,
    sendOfferEmail
};

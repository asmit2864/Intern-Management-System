/**
 * Resume Parser Service using pdf2json
 * Story 2.2: Extract text from PDFs
 */

const fs = require('fs');
const PDFParser = require('pdf2json');

// Regex patterns
const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

// Common skills
const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', '.NET',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'SQL', 'NoSQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'DevOps',
    'Git', 'GitHub', 'GitLab', 'Agile', 'Scrum', 'REST', 'GraphQL', 'API',
    'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap', 'Material-UI',
    'TDD', 'Jest', 'Mocha', 'Pytest', 'JUnit', 'Testing',
    'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch'
];

const extractName = (text) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.length < 50 && /^[A-Z][a-z]+ [A-Z][a-z]+/.test(firstLine)) {
        return firstLine;
    }
    const nameMatch = text.match(/(?:Name|CANDIDATE|APPLICANT)[\s:]+([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i);
    if (nameMatch) return nameMatch[1].trim();
    return null;
};

// Helper to escape special regex characters (like +, ., #)
const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const extractSkills = (text) => {
    const foundSkills = [];
    const lowerText = text.toLowerCase();
    commonSkills.forEach(skill => {
        // Escape skill name for regex (e.g., C++ -> C\+\+)
        const escapedSkill = escapeRegExp(skill);
        const pattern = new RegExp(`\\b${escapedSkill.toLowerCase()}\\b`, 'i');
        if (pattern.test(lowerText)) foundSkills.push(skill);
    });
    return foundSkills.slice(0, 10);
};

const extractExperience = (text) => {
    const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)/i);
    if (expMatch) return `${expMatch[1]} years of experience`;
    const expSection = text.match(/(?:EXPERIENCE|WORK HISTORY)[\s\S]{0,200}/i);
    if (expSection) return expSection[0].substring(0, 100).trim() + '...';
    return 'Experience details in resume';
};

const extractEducation = (text) => {
    const education = [];
    if (!text) return education;

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const educationKeywords = [
        'University', 'College', 'Institute', 'School', 'Academy', 'Vidyalaya',
        'Class X', 'Class XII', '10th', '12th', 'High School', 'Secondary'
    ];

    // Degree patterns
    const degreePatterns = [
        /(?:Bachelor|B\.?S\.?|B\.?A\.?|B\.?Tech|B\.?E\.?)(?:\s+(?:of|in))?\s+([A-Za-z\s]+)/i,
        /(?:Master|M\.?S\.?|M\.?A\.?|M\.?Tech)(?:\s+(?:of|in))?\s+([A-Za-z\s]+)/i,
        /(?:Ph\.?D\.?|Doctorate)/i,
        /(?:Class\s*X|Class\s*XII|10th|12th|HSC|SSC)/i
    ];

    // Scan lines
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isEduLine = educationKeywords.some(keyword => line.includes(keyword) ||
            /\b(?:10th|12th|X|XII)\b/i.test(line));

        if (isEduLine) {
            // Clean Institute Name
            // Remove date ranges starting with 20xx or 19xx (handling potential spaces like 2 0 2 2)
            let institute = line.replace(/(?:2\s*0\s*[0-2]\s*[0-9]|1\s*9\s*[0-9]\s*[0-9])[\s\S]*/, '');
            institute = institute.replace(/[^\w\s.,&-]/g, ''); // Clean chars
            institute = institute.replace(/\s+/g, ' ').trim().replace(/[-,\s]+$/, ''); // Normalize spaces and remove trailing sep

            if (institute.length < 3) continue;

            // Context: This line + next 2 lines
            const contextWindow = lines.slice(i, i + 3).join(' ');

            // Year Logic: 2022-2026 -> 2026; 2022-Present -> Present
            let year = '';
            const rangeMatch = contextWindow.match(/\b(?:20[0-2][0-9])\s*[-–to]+\s*(Present|Current|Now|20[0-2][0-9])\b/i);
            if (rangeMatch) {
                year = rangeMatch[1]; // Returns "2026" or "Present"
                // Normalize "Now"/"Current" to "Present"
                if (/Current|Now/i.test(year)) year = 'Present';
            } else {
                // Single year fallback
                const yearMatch = contextWindow.match(/\b(20[0-2][0-9])\b/);
                if (yearMatch) year = yearMatch[1];
            }

            // Score Logic: Percentage (%) or CGPA (0.00-10.00)
            let cgpa = '';
            const percentageMatch = contextWindow.match(/(\d{2}(?:\.\d+)?)\s*%/);
            if (percentageMatch) {
                cgpa = percentageMatch[1] + '%';
            } else {
                // CGPA strict range
                const cgpaMatch = contextWindow.match(/\b(?:10(?:\.0{1,2})?|[0-9](?:\.[0-9]{1,2})?)\s*(?:\/|of|CGPA|cgpa)/i);
                const cgpaSimple = contextWindow.match(/(?:CGPA|SGPA|GPA)[:\s-]*([0-9]\.[0-9]{1,2})/i);

                if (cgpaSimple) cgpa = cgpaSimple[1];
                else if (cgpaMatch) cgpa = cgpaMatch[0].replace(/[^0-9.]/g, '');
            }

            // Degree Logic
            let degree = '';
            for (const pattern of degreePatterns) {
                const match = contextWindow.match(pattern);
                if (match) {
                    degree = match[0].trim();
                    break;
                }
            }
            // If no specific degree but line mentions X/XII -> infer it
            if (!degree) {
                if (/12th|XII/i.test(contextWindow)) degree = 'Class XII';
                else if (/10th|X\b/i.test(contextWindow)) degree = 'Class X';
            }
            if (!degree && /School|Vidyalaya/i.test(institute)) degree = 'Schooling';
            if (!degree) degree = 'Degree Not Specified';

            // Avoid duplicates based on Institute Name
            const isDuplicate = education.some(e => e.institute === institute);
            if (!isDuplicate) {
                education.push({
                    institute,
                    degree,
                    year,
                    cgpa
                });
            }
        }
    }

    return education;
};

const calculateConfidence = (extractedData) => {
    let score = 0.5;
    if (extractedData.name) score += 0.2;
    if (extractedData.email) score += 0.15;
    if (extractedData.phone) score += 0.05;
    if (extractedData.skills && extractedData.skills.length > 0) score += 0.1;
    if (extractedData.skills && extractedData.skills.length >= 5) score += 0.05;
    return Math.min(score, 0.99);
};

exports.parseResume = async (filePath) => {
    return new Promise((resolve) => {
        // Enable raw text parsing (1)
        const pdfParser = new PDFParser(null, 1);

        console.log(`[Parser] Starting processing for: ${filePath}`);

        pdfParser.on('pdfParser_dataError', (errData) => {
            console.error('[Parser] Error:', errData.parserError);
            resolve({
                success: false,
                error: 'Failed to parse PDF: ' + errData.parserError
            });
        });

        pdfParser.on('pdfParser_dataReady', (pdfData) => {
            console.log('[Parser] Data ready event received');
            try {
                // Extract text from PDF
                const text = pdfParser.getRawTextContent();

                console.log(`[Parser] Extracted text length: ${text ? text.length : 0}`);

                if (!text || text.trim().length < 20) {
                    console.warn('[Parser] Text is empty or too short');
                    return resolve({
                        success: false,
                        error: 'PDF appears to be empty or unreadable (text length < 20)'
                    });
                }

                // Extract information
                const emails = text.match(emailPattern) || [];
                const phones = text.match(phonePattern) || [];

                // Social Links
                const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|www\.linkedin\.com\/in\/)([^/\s]+)/i);
                const githubMatch = text.match(/(?:github\.com\/)([^/\s]+)/i);

                const name = extractName(text);
                const skills = extractSkills(text);
                const experience = extractExperience(text);
                const education = extractEducation(text);

                console.log(`[Parser] Found: Name=${name}, Email=${emails[0]}, Skills=${skills.length}`);

                const extractedData = {
                    name,
                    email: emails[0] || null,
                    phone: phones[0] || null,
                    linkedinUrl: linkedinMatch ? `https://www.linkedin.com/in/${linkedinMatch[1]}` : null,
                    githubUrl: githubMatch ? `https://github.com/${githubMatch[1]}` : null,
                    skills,
                    experience,
                    education
                };

                const confidence = calculateConfidence(extractedData);
                console.log(`[Parser] Confidence Score: ${confidence}`);

                // Enforce Resume Quality Gate
                if (confidence < 0.8) {
                    console.warn('[Parser] Rejected: Low confidence score');
                    resolve({
                        success: false,
                        error: 'Document does not appear to be a valid resume (Low confidence: ' + Math.round(confidence * 100) + '%)'
                    });
                } else {
                    resolve({
                        success: true,
                        data: { ...extractedData, confidence, rawText: text }
                    });
                }

            } catch (error) {
                console.error('[Parser] Extraction error:', error);
                resolve({
                    success: false,
                    error: 'Failed to extract text: ' + error.message
                });
            }
        });

        // Load PDF file with error catching
        try {
            pdfParser.loadPDF(filePath);
        } catch (err) {
            console.error('[Parser] LoadPDF exception:', err);
            resolve({
                success: false,
                error: 'Exception loading PDF: ' + err.message
            });
        }
    });
};

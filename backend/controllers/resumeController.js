const ai = require('../services/huggingface');
const pdfParse = require('pdf-parse');

// POST /api/resume/analyze
exports.analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Extract resume text from PDF
    let resumeText = '';
    try {
      if (req.file.mimetype === 'application/pdf') {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text;
      } else {
        resumeText = `Resume file: ${req.file.originalname}
File type: ${req.file.mimetype}
File size: ${(req.file.size / 1024).toFixed(2)} KB`;
      }
    } catch (parseError) {
      console.error('PDF parse error:', parseError);
      resumeText = `Resume file: ${req.file.originalname}
File type: ${req.file.mimetype}
File size: ${(req.file.size / 1024).toFixed(2)} KB`;
    }

    if (!resumeText || resumeText.trim().length < 50) {
      resumeText = `Resume file: ${req.file.originalname}
File type: ${req.file.mimetype}
File size: ${(req.file.size / 1024).toFixed(2)} KB
Note: Could not extract meaningful text from this file.`;
    }

    // Get job description from request body (optional)
    const jobDescription = req.body.jobDescription || '';

    // Analyze with Hugging Face (pass JD if provided)
    const analysis = await ai.analyzeResumeContent(resumeText, jobDescription);

    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      data: {
        url: null,
        publicId: null,
        originalName: req.file.originalname,
        analysis,
      },
    });
  } catch (error) {
    next(error);
  }
};
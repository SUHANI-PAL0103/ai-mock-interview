const { cloudinary } = require('../config/cloudinary');
const gemini = require('../services/gemini');

// POST /api/resume/analyze
exports.analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'resumes',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // For now, extract filename as "content" since we can't parse PDF on backend easily
    // In production, use pdf-parse or similar
    const resumeText = `Resume file: ${req.file.originalname}
File type: ${req.file.mimetype}
File size: ${(req.file.size / 1024).toFixed(2)} KB`;

    // Analyze with Gemini
    const analysis = await gemini.analyzeResumeContent(resumeText);

    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        originalName: req.file.originalname,
        analysis,
      },
    });
  } catch (error) {
    next(error);
  }
};
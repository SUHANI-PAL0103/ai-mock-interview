const Interview = require('../models/Interview');
const gemini = require('../services/gemini');

// POST /api/interviews
exports.createInterview = async (req, res, next) => {
  try {
    const { role, experience, type, questionCount, techStack } = req.body;

    const count = questionCount || 10;

    // Generate questions using Gemini
    const generatedQuestions = await gemini.generateQuestions({
      role,
      experience,
      type: type || 'Mixed',
      count,
      techStack: techStack || [],
    });

    // Map Gemini response to our schema
    const questions = generatedQuestions.map((q) => ({
      question: q.question,
      category: q.category || 'technical',
      difficulty: q.difficulty || 'medium',
      expectedKeywords: q.expectedKeywords || [],
      answer: '',
      feedback: '',
      score: 0,
    }));

    const interview = await Interview.create({
      user: req.user._id,
      role,
      experience,
      techStack: techStack || [],
      type: type || 'Mixed',
      questionCount: count,
      questions,
    });

    res.status(201).json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/interviews
exports.listInterviews = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const filter = { user: req.user._id };

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) filter.role = { $regex: search, $options: 'i' };

    const interviews = await Interview.find(filter).sort('-createdAt');

    res.json({
      success: true,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/interviews/stats
exports.getStats = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ user: req.user._id });

    const total = interviews.length;
    const completed = interviews.filter((i) => i.status === 'completed');
    const scores = completed.map((i) => i.overallScore || 0);
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const recentInterviews = completed.slice(-5).reverse();

    res.json({
      success: true,
      stats: {
        totalInterviews: total,
        completedInterviews: completed.length,
        averageScore,
        highestScore,
        recentInterviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/interviews/:id
exports.getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/interviews/:id/submit-answer
exports.submitAnswer = async (req, res, next) => {
  try {
    const { questionIndex, answer } = req.body;
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    if (questionIndex === undefined || !interview.questions[questionIndex]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index',
      });
    }

    const currentQuestion = interview.questions[questionIndex];

    // Evaluate answer using Gemini
    const evaluation = await gemini.evaluateAnswer({
      question: currentQuestion.question,
      answer,
      expectedKeywords: currentQuestion.expectedKeywords,
      difficulty: currentQuestion.difficulty,
    });

    // Update question with answer and evaluation
    currentQuestion.answer = answer;
    currentQuestion.feedback = evaluation.feedback || '';
    currentQuestion.score = evaluation.score || 0;
    currentQuestion.technicalScore = evaluation.technicalScore;
    currentQuestion.communicationScore = evaluation.communicationScore;
    currentQuestion.problemSolvingScore = evaluation.problemSolvingScore;
    currentQuestion.confidenceScore = evaluation.confidenceScore;
    currentQuestion.strengths = evaluation.strengths || [];
    currentQuestion.weaknesses = evaluation.weaknesses || [];
    currentQuestion.correctConcepts = evaluation.correctConcepts || [];
    currentQuestion.missingConcepts = evaluation.missingConcepts || [];

    await interview.save();

    // Generate a follow-up question if score is not too low
    let followUp = null;
    if (evaluation.followUpQuestion && evaluation.score >= 30) {
      followUp = {
        question: evaluation.followUpQuestion,
        category: currentQuestion.category,
        difficulty: evaluation.score >= 70 ? 'hard' : 'medium',
        expectedKeywords: [],
        answer: '',
        feedback: '',
        score: 0,
      };
    }

    res.json({
      success: true,
      evaluation: {
        score: evaluation.score,
        technicalScore: evaluation.technicalScore,
        communicationScore: evaluation.communicationScore,
        problemSolvingScore: evaluation.problemSolvingScore,
        confidenceScore: evaluation.confidenceScore,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        correctConcepts: evaluation.correctConcepts,
        missingConcepts: evaluation.missingConcepts,
      },
      followUp,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/interviews/:id/submit
exports.submitInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Interview already completed',
      });
    }

    // Calculate scores
    let totalScore = 0;
    let technicalTotal = 0;
    let communicationTotal = 0;
    let problemSolvingTotal = 0;
    let confidenceTotal = 0;
    let answeredCount = 0;

    interview.questions.forEach((q) => {
      if (q.answer) {
        totalScore += q.score || 0;
        technicalTotal += q.technicalScore || (q.score || 0);
        communicationTotal += q.communicationScore || (q.score || 0);
        problemSolvingTotal += q.problemSolvingScore || (q.score || 0);
        confidenceTotal += q.confidenceScore || (q.score || 0);
        answeredCount++;
      }
    });

    const overallScore = answeredCount > 0 ? Math.round(totalScore / answeredCount) : 0;

    interview.overallScore = overallScore;
    interview.overallTechnicalScore = answeredCount > 0 ? Math.round(technicalTotal / answeredCount) : 0;
    interview.overallCommunicationScore = answeredCount > 0 ? Math.round(communicationTotal / answeredCount) : 0;
    interview.overallProblemSolvingScore = answeredCount > 0 ? Math.round(problemSolvingTotal / answeredCount) : 0;
    interview.overallConfidenceScore = answeredCount > 0 ? Math.round(confidenceTotal / answeredCount) : 0;
    interview.status = 'completed';
    interview.completedAt = new Date();

    await interview.save();

    // Generate summary report using Gemini
    const summaryReport = await gemini.generateSummaryReport({
      role: interview.role,
      experience: interview.experience,
      questions: interview.questions,
      overallScore,
    });

    if (summaryReport) {
      interview.summaryReport = summaryReport;
      await interview.save();
    }

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/interviews/:id
exports.deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    res.json({
      success: true,
      message: 'Interview deleted',
    });
  } catch (error) {
    next(error);
  }
};
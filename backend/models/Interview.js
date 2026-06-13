const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  category: { type: String, default: 'technical' },
  difficulty: { type: String, default: 'medium' },
  expectedKeywords: [String],
  answer: { type: String, default: '' },
  feedback: { type: String, default: '' },
  score: { type: Number, default: 0 },
  technicalScore: { type: Number, default: 0 },
  communicationScore: { type: Number, default: 0 },
  problemSolvingScore: { type: Number, default: 0 },
  confidenceScore: { type: Number, default: 0 },
  strengths: [String],
  weaknesses: [String],
  correctConcepts: [String],
  missingConcepts: [String],
});

const summaryReportSchema = new mongoose.Schema({
  overallFeedback: String,
  strengths: [String],
  weaknesses: [String],
  improvementSuggestions: [String],
  recommendedTopics: [String],
  careerReadiness: String,
  learningRoadmap: [String],
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    experience: {
      type: String,
      required: [true, 'Experience level is required'],
    },
    type: {
      type: String,
      default: 'Mixed',
    },
    techStack: {
      type: [String],
      default: [],
    },
    questionCount: {
      type: Number,
      default: 10,
    },
    questions: [questionSchema],
    overallScore: {
      type: Number,
      default: 0,
    },
    overallTechnicalScore: { type: Number, default: 0 },
    overallCommunicationScore: { type: Number, default: 0 },
    overallProblemSolvingScore: { type: Number, default: 0 },
    overallConfidenceScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    completedAt: Date,
    summaryReport: summaryReportSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
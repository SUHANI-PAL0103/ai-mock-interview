const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate interview questions based on role, experience, type, and count
 */
exports.generateQuestions = async ({ role, experience, type, count, techStack }) => {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-pro' });

    const prompt = `You are an expert technical interviewer. Generate exactly ${count} interview questions for a ${role} candidate at ${experience} level.

Interview Type: ${type}
${techStack && techStack.length ? `Tech Stack: ${techStack.join(', ')}` : ''}

For each question, provide:
1. question: The interview question
2. category: "technical" | "hr" | "behavioral" | "coding" | "mcq"
3. difficulty: "easy" | "medium" | "hard"
4. expectedKeywords: Array of 3-5 key terms/concepts the answer should contain

If the interview type is "Mixed", include a mix of technical, behavioral, and HR questions.
If the type is "Coding", include coding problems with example test cases.
If the type includes "MCQ", include multiple choice questions.

Return ONLY valid JSON array. No markdown, no code blocks, no other text.
Format:
[
  {
    "question": "string",
    "category": "string",
    "difficulty": "string",
    "expectedKeywords": ["string"]
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up - remove any markdown code block markers
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    const questions = JSON.parse(cleaned);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid response format from Gemini');
    }

    return questions;
  } catch (error) {
    console.error('Gemini generateQuestions error:', error);
    // Fallback questions if Gemini fails
    return getFallbackQuestions(role, type, count);
  }
};

/**
 * Evaluate a single answer and return score and feedback
 */
exports.evaluateAnswer = async ({ question, answer, expectedKeywords, difficulty }) => {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-pro' });

    const prompt = `Evaluate this interview answer. Be strict and realistic.

Question: "${question}"
Candidate Answer: "${answer}"
Expected Key Concepts: ${expectedKeywords ? expectedKeywords.join(', ') : 'N/A'}
Difficulty: ${difficulty || 'medium'}

Provide evaluation as JSON only. No markdown, no code blocks, no other text.
{
  "score": <number 0-100>,
  "technicalScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "problemSolvingScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "feedback": "<2-3 sentence detailed feedback>",
  "strengths": ["<strength1>", "<strength2>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "correctConcepts": ["<concept1>"],
  "missingConcepts": ["<concept1>"],
  "followUpQuestion": "<a relevant follow-up question based on this answer>"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini evaluateAnswer error:', error);
    return {
      score: 50,
      technicalScore: 50,
      communicationScore: 50,
      problemSolvingScore: 50,
      confidenceScore: 50,
      feedback: 'Evaluation not available at this time.',
      strengths: ['Answer provided'],
      weaknesses: ['Could not be fully evaluated'],
      correctConcepts: [],
      missingConcepts: [],
      followUpQuestion: null,
    };
  }
};

/**
 * Analyze resume content using Gemini
 */
exports.analyzeResumeContent = async (resumeText) => {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-pro' });

    const prompt = `Analyze this resume content and provide a detailed evaluation.

Resume Content:
${resumeText}

Return ONLY valid JSON. No markdown, no code blocks, no other text.
{
  "resumeScore": <number 0-100>,
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "missingSkills": ["<skill1>", "<skill2>"],
  "atsSuggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"],
  "recommendedRoles": ["<role1>", "<role2>"],
  "roleMatchPercentages": {
    "<role1>": <percentage>,
    "<role2>": <percentage>
  },
  "improvementSummary": "<2-3 sentence summary>"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini analyzeResume error:', error);
    return {
      resumeScore: 70,
      strengths: ['Content detected'],
      missingSkills: ['Could not analyze fully'],
      atsSuggestions: ['Upload a clearer resume file'],
      recommendedRoles: ['General'],
      roleMatchPercentages: {},
      improvementSummary: 'Analysis could not be completed.',
    };
  }
};

/**
 * Generate coding challenge based on role and difficulty
 */
exports.generateCodingChallenge = async ({ role, difficulty, techStack }) => {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-pro' });

    const prompt = `Generate a coding challenge for a ${role} candidate at ${difficulty} level.
${techStack && techStack.length ? `Tech Stack: ${techStack.join(', ')}` : ''}

Return ONLY valid JSON. No markdown, no code blocks, no other text.
{
  "title": "<challenge title>",
  "description": "<detailed problem description>",
  "examples": [
    {"input": "<example input>", "output": "<expected output>", "explanation": "<brief explanation>"}
  ],
  "constraints": ["<constraint1>"],
  "starterCode": "<starter code snippet>",
  "testCases": [
    {"input": "<test input>", "expectedOutput": "<expected output>"}
  ],
  "difficulty": "${difficulty}",
  "topics": ["<topic1>", "<topic2>"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini generateCodingChallenge error:', error);
    return null;
  }
};

/**
 * Generate adaptive follow-up question based on previous answer
 */
exports.generateFollowUp = async ({ originalQuestion, userAnswer, score, role }) => {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-pro' });

    const difficulty = score >= 70 ? 'harder' : score >= 40 ? 'similar' : 'easier';

    const prompt = `Based on this interview exchange, generate a ${difficulty} follow-up question.

Role: ${role}
Original Question: "${originalQuestion}"
User Answer: "${userAnswer}"
Score: ${score}/100

Return ONLY valid JSON. No markdown, no code blocks, no other text.
{
  "question": "<the follow-up question>",
  "difficulty": "${difficulty === 'harder' ? 'hard' : difficulty === 'similar' ? 'medium' : 'easy'}",
  "category": "technical",
  "expectedKeywords": ["<keyword1>", "<keyword2>"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini generateFollowUp error:', error);
    return null;
  }
};

/**
 * Generate overall interview summary report
 */
exports.generateSummaryReport = async ({ role, experience, questions, overallScore }) => {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-pro' });

    const questionsSummary = questions.map((q, i) =>
      `Q${i + 1}: ${q.question} | Score: ${q.score} | Feedback: ${q.feedback}`
    ).join('\n');

    const prompt = `Generate a comprehensive interview summary report.

Role: ${role}
Experience: ${experience}
Overall Score: ${overallScore}/100

Questions and Evaluation:
${questionsSummary}

Return ONLY valid JSON. No markdown, no code blocks, no other text.
{
  "overallFeedback": "<2-3 sentence summary>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "improvementSuggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"],
  "recommendedTopics": ["<topic1>", "<topic2>", "<topic3>"],
  "careerReadiness": "<Beginner | Intermediate | Advanced>",
  "learningRoadmap": ["<step1>", "<step2>", "<step3>"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini generateSummaryReport error:', error);
    return null;
  }
};

// Fallback questions if Gemini API fails
function getFallbackQuestions(role, type, count) {
  const fallbacks = {
    'Java Developer': [
      { question: 'What is the difference between JDK, JRE, and JVM?', category: 'technical', difficulty: 'easy', expectedKeywords: ['JDK', 'JRE', 'JVM', 'compiler', 'runtime'] },
      { question: 'Explain garbage collection in Java.', category: 'technical', difficulty: 'medium', expectedKeywords: ['garbage collection', 'heap', 'mark and sweep', 'generational'] },
      { question: 'What are the main features of Java 8?', category: 'technical', difficulty: 'medium', expectedKeywords: ['lambda', 'stream', 'optional', 'functional interface'] },
      { question: 'Explain the concept of multithreading in Java.', category: 'technical', difficulty: 'hard', expectedKeywords: ['thread', 'synchronization', 'race condition', 'executor service'] },
      { question: 'Describe a challenging project you worked on.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['project', 'challenge', 'solution', 'team'] },
    ],
  };

  const defaultQs = [
    { question: `Explain the core concepts of ${role} role.`, category: 'technical', difficulty: 'medium', expectedKeywords: [role, 'concepts', 'experience'] },
    { question: 'Describe your experience with modern development tools.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['tools', 'experience', 'development'] },
    { question: 'How do you stay updated with industry trends?', category: 'hr', difficulty: 'easy', expectedKeywords: ['learning', 'trends', 'growth'] },
    { question: 'Tell me about a time you resolved a conflict in your team.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['conflict', 'resolution', 'team'] },
    { question: 'What are your career goals for the next 5 years?', category: 'hr', difficulty: 'easy', expectedKeywords: ['goals', 'career', 'growth'] },
    { question: `Explain the difference between REST and GraphQL.`, category: 'technical', difficulty: 'medium', expectedKeywords: ['REST', 'GraphQL', 'API', 'endpoint'] },
    { question: 'How do you ensure code quality in your projects?', category: 'technical', difficulty: 'medium', expectedKeywords: ['testing', 'code review', 'quality', 'CI/CD'] },
    { question: 'Describe a situation where you had to learn a new technology quickly.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['learning', 'adaptability', 'technology'] },
    { question: 'What motivates you to perform at your best?', category: 'hr', difficulty: 'easy', expectedKeywords: ['motivation', 'performance', 'goals'] },
    { question: 'Explain the concept of microservices architecture.', category: 'technical', difficulty: 'hard', expectedKeywords: ['microservices', 'architecture', 'decentralized', 'scalability'] },
  ];

  const pool = fallbacks[role] || defaultQs;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
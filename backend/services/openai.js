const OpenAI = require('openai');
const localai = require('./localai');

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey || apiKey === 'your-openai-api-key-here') {
  console.error('❌ OPENAI_API_KEY is not set or invalid in .env file. Get a key from https://platform.openai.com/api-keys');
}

const openai = new OpenAI({ apiKey });

/**
 * Generate interview questions based on role, experience, type, and count
 */
exports.generateQuestions = async ({ role, experience, type, count, techStack }) => {
  try {
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

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const text = response.choices[0]?.message?.content || '';
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const questions = JSON.parse(cleaned);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid response format from OpenAI');
    }

    return questions;
  } catch (error) {
    console.error('OpenAI generateQuestions error:', error);
    return localai.generateQuestions({ role, experience, type, count, techStack });
  }
};

/**
 * Evaluate a single answer and return score and feedback
 */
exports.evaluateAnswer = async ({ question, answer, expectedKeywords, difficulty }) => {
  try {
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

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 2048,
    });

    const text = response.choices[0]?.message?.content || '';
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('OpenAI evaluateAnswer error:', error);
    return localai.evaluateAnswer({ question, answer, expectedKeywords, difficulty });
  }
};

/**
 * Analyze resume content using ChatGPT
 */
exports.analyzeResumeContent = async (resumeText, jobDescription, retries = 3) => {
  const jdSection = jobDescription
    ? `\n\nJob Description:\n${jobDescription}`
    : '';

  const prompt = `You are an expert ATS (Applicant Tracking System) and resume analyst. Analyze this resume content${jobDescription ? ' against the provided job description' : ''} and provide a detailed evaluation.

Resume Content:
${resumeText}
${jdSection}

IMPORTANT: If a Job Description is provided, evaluate the resume against it specifically (keyword matching, skill gaps, role fit). If no JD is provided, do a general resume quality evaluation.

Return ONLY valid JSON. No markdown, no code blocks, no other text.
{
  "resumeScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "keywordMatch": <number 0-100>,
  "formattingScore": <number 0-100>,
  "experienceRelevance": <number 0-100>,
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "missingSkills": ["<skill1>", "<skill2>"],
  "atsSuggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"],
  "recommendedRoles": ["<role1>", "<role2>"],
  "roleMatchPercentages": {
    "<role1>": <percentage>,
    "<role2>": <percentage>
  },
  "improvementSummary": "<2-3 sentence summary>",
  "atsBreakdown": {
    "keywordsFound": ["<keyword1>", "<keyword2>"],
    "keywordsMissing": ["<missingKeyword1>", "<missingKeyword2>"],
    "formattingIssues": ["<issue1>", "<issue2>"],
    "contentGaps": ["<gap1>", "<gap2>"]
  }
}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4096,
      });

      const text = response.choices[0]?.message?.content || '';
      const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      const isRateLimit = error.status === 429;
      if ((isRateLimit || error.status === 429) && attempt < retries) {
        const delay = Math.pow(2, attempt) * 2000;
        console.log(`OpenAI rate limited. Retrying in ${delay/1000}s... (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      console.error('OpenAI analyzeResume error:', error.message || error);
      return localai.analyzeResume(resumeText, jobDescription);
    }
  }
};

/**
 * Generate coding challenge based on role and difficulty
 */
exports.generateCodingChallenge = async ({ role, difficulty, techStack }) => {
  try {
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

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const text = response.choices[0]?.message?.content || '';
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('OpenAI generateCodingChallenge error:', error);
    return null;
  }
};

/**
 * Generate adaptive follow-up question based on previous answer
 */
exports.generateFollowUp = async ({ originalQuestion, userAnswer, score, role }) => {
  try {
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

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const text = response.choices[0]?.message?.content || '';
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('OpenAI generateFollowUp error:', error);
    return null;
  }
};

/**
 * Generate overall interview summary report
 */
exports.generateSummaryReport = async ({ role, experience, questions, overallScore }) => {
  try {
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

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 4096,
    });

    const text = response.choices[0]?.message?.content || '';
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('OpenAI generateSummaryReport error:', error);
    return localai.generateSummaryReport({ role, experience, questions, overallScore });
  }
};
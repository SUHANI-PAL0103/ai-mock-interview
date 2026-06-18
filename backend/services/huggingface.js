const localai = require('./localai');

const API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
const API_URL = `https://api-inference.huggingface.co/models/${MODEL}`;

if (!API_KEY || API_KEY === 'your-huggingface-api-key-here') {
  console.error('❌ HUGGINGFACE_API_KEY is not set or invalid in .env file. Get a free token from https://huggingface.co/settings/tokens');
}

/**
 * Call Hugging Face Inference API with a prompt
 */
async function callHuggingFace(prompt, maxTokens = 4096, temperature = 0.5) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: maxTokens,
        temperature,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Hugging Face API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  
  // Extract generated text from response
  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }
  if (data.generated_text) {
    return data.generated_text;
  }
  throw new Error('Unexpected response format from Hugging Face');
}

/**
 * Clean JSON from model output
 */
function extractJSON(text) {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  // Try to find JSON array or object in the response
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) return arrayMatch[0];
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) return objectMatch[0];
  return cleaned;
}

/**
 * Generate interview questions
 */
exports.generateQuestions = async ({ role, experience, type, count, techStack }) => {
  try {
    const prompt = `<s>[INST] You are an expert technical interviewer. Generate exactly ${count} interview questions for a ${role} candidate at ${experience} level.

Interview Type: ${type}
${techStack && techStack.length ? `Tech Stack: ${techStack.join(', ')}` : ''}

For each question, provide:
1. question: The interview question
2. category: "technical" | "hr" | "behavioral" | "coding" | "mcq"
3. difficulty: "easy" | "medium" | "hard"
4. expectedKeywords: Array of 3-5 key terms

Return ONLY valid JSON array. No markdown, no other text.
Format:
[
  {
    "question": "string",
    "category": "string",
    "difficulty": "string",
    "expectedKeywords": ["string"]
  }
] [/INST]`;

    const text = await callHuggingFace(prompt, 4096, 0.7);
    const jsonStr = extractJSON(text);
    const questions = JSON.parse(jsonStr);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid response format');
    }

    return questions;
  } catch (error) {
    console.error('HuggingFace generateQuestions error:', error);
    return localai.generateQuestions({ role, experience, type, count, techStack });
  }
};

/**
 * Evaluate a single answer
 */
exports.evaluateAnswer = async ({ question, answer, expectedKeywords, difficulty }) => {
  try {
    const prompt = `<s>[INST] Evaluate this interview answer. Be strict and realistic.

Question: "${question}"
Candidate Answer: "${answer}"
Expected Key Concepts: ${expectedKeywords ? expectedKeywords.join(', ') : 'N/A'}
Difficulty: ${difficulty || 'medium'}

Provide evaluation as JSON only. No markdown, no other text.
{
  "score": <number 0-100>,
  "technicalScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "problemSolvingScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "feedback": "<2-3 sentence feedback>",
  "strengths": ["<strength1>", "<strength2>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "correctConcepts": ["<concept1>"],
  "missingConcepts": ["<concept1>"],
  "followUpQuestion": "<follow-up question>"
} [/INST]`;

    const text = await callHuggingFace(prompt, 2048, 0.3);
    const jsonStr = extractJSON(text);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('HuggingFace evaluateAnswer error:', error);
    return localai.evaluateAnswer({ question, answer, expectedKeywords, difficulty });
  }
};

/**
 * Analyze resume content
 */
exports.analyzeResumeContent = async (resumeText, jobDescription, retries = 3) => {
  const jdSection = jobDescription
    ? `\n\nJob Description:\n${jobDescription}`
    : '';

  const prompt = `<s>[INST] You are an expert ATS (Applicant Tracking System) and resume analyst. Analyze this resume content${jobDescription ? ' against the provided job description' : ''} and provide a detailed evaluation.

Resume Content:
${resumeText}
${jdSection}

Return ONLY valid JSON. No markdown, no other text.
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
    "contentGaps": ["<gap1>", "<gap2>"]
  }
} [/INST]`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const text = await callHuggingFace(prompt, 4096, 0.3);
      const jsonStr = extractJSON(text);
      return JSON.parse(jsonStr);
    } catch (error) {
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 2000;
        console.log(`HuggingFace rate limited. Retrying in ${delay/1000}s... (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      console.error('HuggingFace analyzeResume error:', error.message || error);
      return localai.analyzeResume(resumeText, jobDescription);
    }
  }
};

/**
 * Generate coding challenge
 */
exports.generateCodingChallenge = async ({ role, difficulty, techStack }) => {
  try {
    const prompt = `<s>[INST] Generate a coding challenge for a ${role} candidate at ${difficulty} level.
${techStack && techStack.length ? `Tech Stack: ${techStack.join(', ')}` : ''}

Return ONLY valid JSON. No markdown, no other text.
{
  "title": "<challenge title>",
  "description": "<detailed problem description>",
  "examples": [
    {"input": "<example input>", "output": "<expected output>", "explanation": "<explanation>"}
  ],
  "constraints": ["<constraint1>"],
  "starterCode": "<starter code>",
  "testCases": [
    {"input": "<test input>", "expectedOutput": "<expected output>"}
  ],
  "difficulty": "${difficulty}",
  "topics": ["<topic1>", "<topic2>"]
} [/INST]`;

    const text = await callHuggingFace(prompt, 4096, 0.7);
    const jsonStr = extractJSON(text);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('HuggingFace generateCodingChallenge error:', error);
    return null;
  }
};

/**
 * Generate follow-up question
 */
exports.generateFollowUp = async ({ originalQuestion, userAnswer, score, role }) => {
  try {
    const difficulty = score >= 70 ? 'harder' : score >= 40 ? 'similar' : 'easier';

    const prompt = `<s>[INST] Based on this interview exchange, generate a ${difficulty} follow-up question.

Role: ${role}
Original Question: "${originalQuestion}"
User Answer: "${userAnswer}"
Score: ${score}/100

Return ONLY valid JSON. No markdown, no other text.
{
  "question": "<the follow-up question>",
  "difficulty": "${difficulty === 'harder' ? 'hard' : difficulty === 'similar' ? 'medium' : 'easy'}",
  "category": "technical",
  "expectedKeywords": ["<keyword1>", "<keyword2>"]
} [/INST]`;

    const text = await callHuggingFace(prompt, 1024, 0.7);
    const jsonStr = extractJSON(text);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('HuggingFace generateFollowUp error:', error);
    return null;
  }
};

/**
 * Generate summary report
 */
exports.generateSummaryReport = async ({ role, experience, questions, overallScore }) => {
  try {
    const questionsSummary = questions.map((q, i) =>
      `Q${i + 1}: ${q.question} | Score: ${q.score} | Feedback: ${q.feedback}`
    ).join('\n');

    const prompt = `<s>[INST] Generate a comprehensive interview summary report.

Role: ${role}
Experience: ${experience}
Overall Score: ${overallScore}/100

Questions and Evaluation:
${questionsSummary}

Return ONLY valid JSON. No markdown, no other text.
{
  "overallFeedback": "<2-3 sentence summary>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "improvementSuggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"],
  "recommendedTopics": ["<topic1>", "<topic2>", "<topic3>"],
  "careerReadiness": "<Beginner | Intermediate | Advanced>",
  "learningRoadmap": ["<step1>", "<step2>", "<step3>"]
} [/INST]`;

    const text = await callHuggingFace(prompt, 4096, 0.5);
    const jsonStr = extractJSON(text);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('HuggingFace generateSummaryReport error:', error);
    return localai.generateSummaryReport({ role, experience, questions, overallScore });
  }
};
/**
 * Local AI Service - Generates AI-like content for interviews and resume analysis
 * without requiring any external API keys or paid services.
 * 
 * This is a fallback that produces realistic, structured output so the app
 * remains fully functional without Gemini/OpenAI.
 */

const QUESTION_TEMPLATES = {
  technical: {
    react: [
      'Explain the virtual DOM in React and how it improves performance.',
      'What is the difference between state and props in React?',
      'How does React handle component lifecycle with hooks like useEffect?',
      'Explain the concept of lifting state up in React applications.',
      'What are React hooks and how do they differ from class components?',
      'How do you optimize React component rendering?',
      'Explain React Context API and when you would use it over Redux.',
      'What is the purpose of useCallback and useMemo hooks?',
      'How does React handle forms and controlled components?',
      'Explain the concept of reconciliation in React.',
    ],
    javascript: [
      'Explain closures in JavaScript with an example.',
      'What is the event loop and how does it work?',
      'Explain prototypal inheritance in JavaScript.',
      'What are promises and how do they differ from callbacks?',
      'How does async/await work in JavaScript?',
      'What is the difference between let, const, and var?',
      'Explain the concept of hoisting in JavaScript.',
      'What are JavaScript design patterns? Give examples.',
      'How does JavaScript handle asynchronous operations?',
      'Explain the spread operator and rest parameters.',
    ],
    nodejs: [
      'Explain the Node.js event loop phases.',
      'What is middleware in Express.js? Give examples.',
      'How do you handle errors in Node.js applications?',
      'Explain the difference between process.nextTick and setImmediate.',
      'What are streams in Node.js and why are they useful?',
      'How does npm handle dependency resolution?',
      'Explain the concept of child processes in Node.js.',
      'What is clustering in Node.js and how does it work?',
      'How do you secure a Node.js REST API?',
      'Explain the purpose of package.json and package-lock.json.',
    ],
    python: [
      'Explain Python decorators with examples.',
      'What is the difference between lists and tuples in Python?',
      'How does Python handle memory management?',
      'Explain list comprehensions and generator expressions.',
      'What are Python context managers and how do you use them?',
      'Explain the Global Interpreter Lock (GIL) in Python.',
      'How do you handle exceptions in Python?',
      'What is the difference between deep copy and shallow copy?',
      'Explain Python\'s __init__ method and self parameter.',
      'What are Python decorators used for in web frameworks?',
    ],
    java: [
      'Explain the concept of OOP in Java.',
      'What is the difference between Abstract classes and Interfaces?',
      'How does Java handle garbage collection?',
      'Explain multithreading in Java.',
      'What are Java Streams and how do you use them?',
      'Explain the Spring Boot framework architecture.',
      'What is dependency injection in Spring?',
      'How do you handle exceptions in Java?',
      'Explain Java Collections Framework.',
      'What are lambda expressions in Java 8?',
    ],
  },
  hr: [
    'Tell me about yourself and your background.',
    'Why do you want to work at our company?',
    'What are your greatest strengths and weaknesses?',
    'Where do you see yourself in 5 years?',
    'Why are you leaving your current role?',
    'Tell me about a time you handled a difficult situation at work.',
    'How do you handle criticism or feedback?',
    'Describe your ideal work environment.',
    'What motivates you to perform at your best?',
    'Tell me about a time you showed leadership.',
  ],
  behavioral: [
    'Describe a challenging project you worked on and how you overcame obstacles.',
    'Tell me about a time you had a conflict with a teammate and how you resolved it.',
    'Describe a situation where you had to learn a new technology quickly.',
    'Tell me about a time you made a mistake and how you handled it.',
    'Describe a project where you took initiative beyond your role.',
    'Tell me about a time you worked under pressure to meet a deadline.',
    'Describe a situation where you had to persuade others to adopt your idea.',
    'Tell me about a time you mentored or helped a colleague grow.',
    'Describe a situation where you had to make a difficult decision.',
    'Tell me about a time you received constructive feedback and acted on it.',
  ],
  problem_solving: [
    'Design a URL shortening service like bit.ly.',
    'How would you design a real-time chat application?',
    'Design a rate limiting system for an API.',
    'How would you detect if a linked list has a cycle?',
    'Design an e-commerce inventory management system.',
    'How would you implement an autocomplete feature?',
    'Design a distributed caching system.',
    'How would you design a job scheduling system?',
    'Design a recommendation engine for a content platform.',
    'How would you handle a system that needs to process millions of events per second?',
  ],
};

const RESUME_STRENGTHS = [
  'Strong technical background with relevant experience',
  'Clear career progression and growth',
  'Good use of metrics and quantifiable achievements',
  'Relevant certifications and education',
  'Strong project management skills',
  'Excellent communication abilities',
  'Demonstrated leadership experience',
  'Strong problem-solving capabilities',
  'Experience with modern tech stack',
  'Good mix of technical and soft skills',
  'Relevant industry experience',
  'Strong understanding of software development lifecycle',
];

const RESUME_WEAKNESSES = [
  'Consider adding more quantifiable achievements',
  'Could benefit from additional certifications',
  'Job descriptions could be more detailed',
  'Consider highlighting specific technologies used',
  'Gaps in employment could be addressed',
  'Adding a professional summary would strengthen the resume',
  'Consider including volunteer or open source contributions',
  'Could include more relevant keywords for ATS',
  'Consider adding a skills section with proficiency levels',
  'Formatting could be improved for better readability',
];

const RECOMMENDATIONS = [
  'Add a professional summary at the top of your resume',
  'Quantify achievements with specific metrics and numbers',
  'Use industry-standard keywords for better ATS matching',
  'Tailor your resume to each job application',
  'Include relevant projects and their impact',
  'Keep resume to one page if possible',
  'Use action verbs to describe your experience',
  'Highlight technical skills prominently',
  'Include links to portfolio, GitHub, or LinkedIn',
  'Proofread carefully for grammar and consistency',
];

/**
 * Detect primary tech from skills array
 */
function detectTech(skills) {
  if (!skills || skills.length === 0) return 'javascript';
  const skillStr = Array.isArray(skills) ? skills.join(' ').toLowerCase() : String(skills).toLowerCase();
  if (skillStr.includes('react') || skillStr.includes('angular') || skillStr.includes('vue')) return 'react';
  if (skillStr.includes('node') || skillStr.includes('express') || skillStr.includes('nestjs')) return 'nodejs';
  if (skillStr.includes('python') || skillStr.includes('django') || skillStr.includes('flask')) return 'python';
  if (skillStr.includes('java') || skillStr.includes('spring')) return 'java';
  return 'javascript';
}

/**
 * Shuffle array and pick n items
 */
function pick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

/**
 * Generate interview questions locally
 */
exports.generateQuestions = async ({ role, experience, type, count, techStack }) => {
  try {
    const tech = detectTech(techStack);
    const techQuestions = QUESTION_TEMPLATES.technical[tech] || QUESTION_TEMPLATES.technical.javascript;
    const hrQuestions = QUESTION_TEMPLATES.hr;
    const behavioralQuestions = QUESTION_TEMPLATES.behavioral;
    const problemSolvingQuestions = QUESTION_TEMPLATES.problem_solving;

    const totalNeeded = count || 10;
    const perCategory = Math.ceil(totalNeeded / 4);

    const questions = [
      ...pick(techQuestions, perCategory).map(q => ({
        question: q,
        category: 'technical',
        difficulty: experience === 'senior' ? 'hard' : experience === 'mid' ? 'medium' : 'easy',
        expectedKeywords: [tech, 'concepts', 'experience'],
      })),
      ...pick(hrQuestions, perCategory).map(q => ({
        question: q,
        category: 'hr',
        difficulty: 'easy',
        expectedKeywords: ['experience', 'growth', 'teamwork'],
      })),
      ...pick(behavioralQuestions, perCategory).map(q => ({
        question: q,
        category: 'behavioral',
        difficulty: 'medium',
        expectedKeywords: ['teamwork', 'problem-solving', 'communication'],
      })),
      ...pick(problemSolvingQuestions, perCategory).map(q => ({
        question: q,
        category: 'coding',
        difficulty: experience === 'senior' ? 'hard' : 'medium',
        expectedKeywords: ['design', 'architecture', 'scalability'],
      })),
    ].slice(0, totalNeeded);

    return questions;
  } catch (error) {
    console.error('LocalAI generateQuestions error:', error);
    return [];
  }
};

/**
 * Evaluate a single answer locally
 */
exports.evaluateAnswer = async ({ question, answer, expectedKeywords, difficulty }) => {
  try {
    if (!answer || answer.trim().length < 10) {
      return {
        score: 20,
        technicalScore: 15,
        communicationScore: 25,
        problemSolvingScore: 20,
        confidenceScore: 20,
        feedback: 'The answer is too brief. Please provide a more detailed response with specific examples and technical depth.',
        strengths: [],
        weaknesses: ['Answer too brief', 'Lack of detail'],
        correctConcepts: [],
        missingConcepts: ['Detailed explanation', 'Technical depth', 'Examples'],
        followUpQuestion: 'Can you elaborate further on your experience with this topic?',
      };
    }

    const answerLength = answer.length;
    const hasKeywords = expectedKeywords && expectedKeywords.length > 0
      ? expectedKeywords.filter(k => answer.toLowerCase().includes(k.toLowerCase())).length
      : 0;
    const keywordRatio = expectedKeywords && expectedKeywords.length > 0 ? hasKeywords / expectedKeywords.length : 0.5;

    // Calculate scores based on answer quality
    const baseScore = Math.min(60 + Math.floor(answerLength / 20), 85);
    const keywordBonus = Math.floor(keywordRatio * 15);
    const totalScore = Math.min(baseScore + keywordBonus, 98);

    // Generate feedback
    let feedback = '';
    if (totalScore >= 80) {
      feedback = 'Strong answer that demonstrates good understanding. The candidate provided clear explanations and relevant examples.';
    } else if (totalScore >= 60) {
      feedback = 'Decent answer covering the basics. Could benefit from more specific examples and deeper technical detail.';
    } else if (totalScore >= 40) {
      feedback = 'The answer touches on key points but lacks sufficient depth and specificity. Consider adding examples and technical details.';
    } else {
      feedback = 'The answer needs significant improvement. Focus on understanding the core concepts and providing structured responses.';
    }

    const strengths = answerLength > 100
      ? ['Provided detailed response', 'Showed engagement with the question']
      : ['Attempted to answer the question'];

    const weaknesses = [];
    if (keywordRatio < 0.5) weaknesses.push('Missing expected key concepts');
    if (answerLength < 100) weaknesses.push('Answer length could be expanded');
    if (answerLength < 50) weaknesses.push('Very brief response');

    const correctConcepts = expectedKeywords
      ? expectedKeywords.filter(k => answer.toLowerCase().includes(k.toLowerCase()))
      : [];
    const missingConcepts = expectedKeywords
      ? expectedKeywords.filter(k => !answer.toLowerCase().includes(k.toLowerCase()))
      : [];

    return {
      score: totalScore,
      technicalScore: totalScore - Math.floor(Math.random() * 10),
      communicationScore: totalScore - Math.floor(Math.random() * 5),
      problemSolvingScore: totalScore - Math.floor(Math.random() * 15),
      confidenceScore: totalScore - Math.floor(Math.random() * 8),
      feedback,
      strengths: strengths.slice(0, 2),
      weaknesses: weaknesses.slice(0, 2),
      correctConcepts: correctConcepts.slice(0, 3),
      missingConcepts: missingConcepts.slice(0, 3),
      followUpQuestion: totalScore >= 70
        ? `That's a good answer. Can you think of a real-world scenario where you applied these concepts?`
        : `Let me ask a simpler version: what do you understand by the core concepts involved in this question?`,
    };
  } catch (error) {
    console.error('LocalAI evaluateAnswer error:', error);
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
 * Analyze resume content locally
 */
exports.analyzeResume = async (resumeText, jobDescription) => {
  try {
    const hasJobDescription = jobDescription && jobDescription.trim().length > 20;

    // Extract meaningful content length
    const textLength = resumeText ? resumeText.length : 0;
    const hasEmail = resumeText ? /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText) : false;
    const hasPhone = resumeText ? /[\+]?[\d\-\(\)\s]{7,}/.test(resumeText) : false;
    const hasGithub = resumeText ? /github\.com/i.test(resumeText) : false;
    const hasLinkedIn = resumeText ? /linkedin\.com/i.test(resumeText) : false;

    // Detect skills mentioned in resume
    const commonSkills = ['React', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'Git', 'REST API', 'GraphQL', 'CSS', 'HTML', 'Angular', 'Vue.js', 'Express', 'Django', 'Flask', 'Spring', 'C++', 'C#', 'Go', 'Ruby', 'PHP', 'Azure', 'GCP', 'CI/CD', 'Agile', 'Scrum', 'Machine Learning', 'Deep Learning', 'NLP', 'TensorFlow', 'PyTorch'];
    const matchedSkills = commonSkills.filter(skill =>
      resumeText ? resumeText.toLowerCase().includes(skill.toLowerCase()) : false
    );

    // Parse job description for keywords
    const jdKeywords = hasJobDescription
      ? commonSkills.filter(skill => jobDescription.toLowerCase().includes(skill.toLowerCase()))
      : [];

    const missingKeywords = hasJobDescription
      ? jdKeywords.filter(skill => !matchedSkills.includes(skill))
      : [];

    // Calculate ATS score
    let atsScore = 60;
    if (hasEmail) atsScore += 5;
    if (hasPhone) atsScore += 5;
    if (hasGithub) atsScore += 5;
    if (hasLinkedIn) atsScore += 5;
    if (textLength > 500) atsScore += 5;
    if (textLength > 1000) atsScore += 5;
    if (matchedSkills.length >= 5) atsScore += 5;
    if (matchedSkills.length >= 10) atsScore += 5;
    if (hasJobDescription && missingKeywords.length === 0) atsScore += 10;
    atsScore = Math.min(atsScore, 98);

    const strengths = pick(RESUME_STRENGTHS, 3);
    const missingSkills = matchedSkills.length > 0 ? [] : ['Consider adding specific technical skills'];
    const suggestions = pick(RECOMMENDATIONS, 3);

    return {
      resumeScore: atsScore,
      atsScore: hasJobDescription ? atsScore - 5 : atsScore,
      keywordMatch: hasJobDescription ? Math.max(40, 100 - missingKeywords.length * 10) : 60,
      formattingScore: hasEmail ? 80 : 60,
      experienceRelevance: matchedSkills.length > 0 ? 70 + Math.min(matchedSkills.length * 3, 20) : 50,
      strengths,
      missingSkills: missingKeywords.length > 0 ? missingKeywords : missingSkills,
      atsSuggestions: suggestions,
      recommendedRoles: matchedSkills.length > 0 ? ['Software Developer', 'Full Stack Developer'] : ['General'],
      roleMatchPercentages: matchedSkills.length > 0 ? { 'Software Developer': Math.min(50 + matchedSkills.length * 5, 95) } : {},
      improvementSummary: suggestions[0] || 'Consider adding more details to your resume.',
      atsBreakdown: {
        keywordsFound: matchedSkills.length > 0 ? matchedSkills.slice(0, 8) : [],
        keywordsMissing: missingKeywords.length > 0 ? missingKeywords.slice(0, 5) : [],
        formattingIssues: [],
        contentGaps: [],
      },
    };
  } catch (error) {
    console.error('LocalAI analyzeResume error:', error);
    return {
      resumeScore: 70,
      atsScore: 50,
      keywordMatch: 50,
      formattingScore: 60,
      experienceRelevance: 60,
      strengths: ['Content detected'],
      missingSkills: ['Could not analyze fully'],
      atsSuggestions: ['Upload a clearer resume file'],
      recommendedRoles: ['General'],
      roleMatchPercentages: {},
      improvementSummary: 'Analysis could not be completed.',
      atsBreakdown: {
        keywordsFound: [],
        keywordsMissing: [],
        formattingIssues: [],
        contentGaps: [],
      },
    };
  }
};

/**
 * Generate summary report locally
 */
exports.generateSummaryReport = async ({ role, experience, questions, overallScore }) => {
  const levels = overallScore >= 80 ? 'Advanced' : overallScore >= 60 ? 'Intermediate' : 'Beginner';
  return {
    overallFeedback: `The candidate performed at a ${levels.toLowerCase()} level for the ${role} position. ${overallScore >= 70 ? 'Strong technical foundation demonstrated.' : 'Areas for improvement identified.'}`,
    strengths: ['Answered questions', 'Showed engagement', 'Technical awareness'],
    weaknesses: overallScore < 70 ? ['Could provide more detailed responses', 'Consider deepening technical knowledge'] : [],
    improvementSuggestions: overallScore < 70
      ? ['Practice answering questions with more structure', 'Study core concepts in depth', 'Build more projects for hands-on experience']
      : ['Continue building on strong foundations', 'Explore advanced topics', 'Practice system design questions'],
    recommendedTopics: ['Data structures', 'System design', 'Best practices'],
    careerReadiness: levels,
    learningRoadmap: [
      'Review fundamental concepts',
      'Practice with real-world projects',
      'Study system design patterns',
      'Build a portfolio of work',
    ],
  };
};
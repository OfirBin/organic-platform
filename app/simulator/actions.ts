'use server'

import prisma from '@/lib/prisma'

export async function getAvailableYears() {
  const questions = await prisma.question.findMany({
    where: { sourceExam: { not: null } },
    select: { sourceExam: true }
  });

  const years = new Set<string>();
  for (const q of questions) {
    if (q.sourceExam) {
      const match = q.sourceExam.match(/\b(19|20)\d{2}\b/);
      if (match) {
        years.add(match[0]);
      }
    }
  }

  return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
}

export type ExamConfig = {
  limit: number;
  source: "real" | "ai" | "both";
  years: string[];
  topics: string[];
};

export async function generateExam(config: ExamConfig) {
  const whereClause: any = {};

  if (config.topics && config.topics.length > 0) {
    whereClause.topic = { in: config.topics };
  }

  if (config.source === "real") {
    whereClause.sourceExam = { not: null };
  } else if (config.source === "ai") {
    whereClause.sourceExam = null;
  }

  const allMatchingQuestions = await prisma.question.findMany({
    where: whereClause
  });

  let filteredQuestions = allMatchingQuestions;

  // Filter by year if we are not restricted to just AI (which has no year)
  if (config.source !== "ai" && config.years && config.years.length > 0) {
    filteredQuestions = allMatchingQuestions.filter(q => {
      // Allow AI generated questions through if 'both' is selected
      if (!q.sourceExam) return true;
      
      const match = q.sourceExam.match(/\b(19|20)\d{2}\b/);
      if (match) {
        return config.years.includes(match[0]);
      }
      
      // If no year found in string, include it so we don't accidentally hide questions
      return true;
    });
  }

  // Shuffle the results
  const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, config.limit);

  return selected.map((q, idx) => {
    const wrongAnswers = JSON.parse(q.distractors || '[]');
    const rawOptions = [
      q.answer,
      ...wrongAnswers
    ];
    
    // Shuffle options
    const shuffledOptions = rawOptions.sort(() => 0.5 - Math.random());

    return {
      id: q.id,
      text: q.text,
      hasImage: !!q.imageUrl,
      options: shuffledOptions,
      correctAnswer: q.answer,
      explanation: `This question was dynamically pulled from the database. The correct answer is: ${q.answer}.`
    };
  });
}

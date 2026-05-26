'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getStudyQuestions() {
  const questions = await prisma.question.findMany({
    include: { stat: true },
    orderBy: [
      { stat: { timesStudied: 'asc' } },
      { stat: { easeFactor: 'asc' } },
      { createdAt: 'asc' }
    ],
  });
  return questions;
}

export async function updateQuestionStat(questionId: string, isCorrect: boolean) {
  const stat = await prisma.cardStat.findUnique({
    where: { questionId },
  });

  if (stat) {
    await prisma.cardStat.update({
      where: { questionId },
      data: {
        timesStudied: { increment: 1 },
        timesCorrect: isCorrect ? { increment: 1 } : undefined,
        timesIncorrect: !isCorrect ? { increment: 1 } : undefined,
      },
    });
  } else {
    await prisma.cardStat.create({
      data: {
        questionId,
        timesStudied: 1,
        timesCorrect: isCorrect ? 1 : 0,
        timesIncorrect: !isCorrect ? 1 : 0,
      },
    });
  }

  revalidatePath('/dashboard');
}

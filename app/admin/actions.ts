'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addQuestion(formData: FormData) {
  const topic = formData.get('topic') as string
  const sourceExam = formData.get('sourceExam') as string
  const text = formData.get('text') as string
  const answer = formData.get('answer') as string

  if (!topic || !answer) throw new Error("Topic and Answer are required.")

  // Save to SQLite and auto-generate the spaced repetition stats
  await prisma.question.create({
    data: {
      topic,
      sourceExam,
      text,
      answer,
      stat: {
        create: {
          easeFactor: 2.5
        }
      }
    }
  })

  // Tell Next.js to refresh the page to show the new question
  revalidatePath('/admin')
}

export async function getQuestions() {
  return await prisma.question.findMany({
    orderBy: { createdAt: 'desc' },
    include: { stat: true } // Pulls in the spaced-repetition data too
  })
}
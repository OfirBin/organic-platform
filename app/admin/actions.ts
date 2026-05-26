'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

import fs from 'fs'
import path from 'path'
import os from 'os'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'

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

export async function autoImportExam(formData: FormData) {
  const file = formData.get('file') as File;

  if (!file) {
    throw new Error('File is required.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const tempFilePath = path.join(os.tmpdir(), `${Date.now()}-${file.name}`);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(tempFilePath, buffer);

    const fileManager = new GoogleAIFileManager(apiKey);
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: file.type || "application/pdf",
      displayName: file.name
    });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const prompt = "You are an expert Organic Chemistry professor. Read this exam PDF. Extract every single multiple-choice or open-ended question. For each question, extract the correct answer, assign it a broad chemistry 'topic' (e.g., SN1/SN2, Stereochemistry, Spectroscopy), and note the source exam. Return strictly a JSON array of objects matching this schema: [{ \"text\": string, \"answer\": string, \"topic\": string, \"sourceExam\": string }].";

    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await model.generateContent([
          { fileData: { mimeType: uploadResult.file.mimeType, fileUri: uploadResult.file.uri } },
          prompt
        ]);
        break;
      } catch (err: any) {
        if (err.status === 503 && retries > 1) {
          retries--;
          await new Promise(res => setTimeout(res, 2000));
          continue;
        }
        throw err;
      }
    }
    
    if (!result) {
      throw new Error("Failed to generate content from Gemini.");
    }

    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/i, '').replace(/```/g, '').trim();
    const parsedQuestions = JSON.parse(cleanedText) as { text: string, answer: string, topic: string, sourceExam: string }[];

    // Insert to database
    for (const q of parsedQuestions) {
      await prisma.question.create({
        data: {
          text: q.text,
          answer: q.answer,
          topic: q.topic,
          sourceExam: q.sourceExam,
          stat: {
            create: {
              timesStudied: 0,
              timesCorrect: 0,
              timesIncorrect: 0,
              easeFactor: 2.5
            }
          }
        }
      });
    }

  } catch (error) {
    console.error('Failed to import exam:', error);
    throw new Error('Failed to import exam. Please try again.');
  } finally {
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (cleanupErr) {
      console.error('Failed to clean up temp file:', cleanupErr);
    }
  }

  revalidatePath('/admin');
}
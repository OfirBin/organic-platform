'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

import fs from 'fs'
import path from 'path'
import os from 'os'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'

export async function uploadDocument(formData: FormData) {
  const title = formData.get('title') as string;
  const file = formData.get('file') as File;

  if (!title || !file) {
    throw new Error('Title and file are required.');
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
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const prompt = "You are an expert Organic Chemistry tutor. Read this lecture PDF. Break down the content page-by-page. For each page, transcribe the core text (handling both Hebrew and English flawlessly) and meticulously describe any chemical mechanisms, Newman projections, or 3D chairs shown in the images. Return your response strictly as a JSON array of objects, where each object has a 'pageNumber' (integer) and 'content' (string containing the notes/mechanism descriptions).";

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
    const parsedChunks = JSON.parse(cleanedText) as { pageNumber: number, content: string }[];

    await prisma.document.create({
      data: {
        title,
        type: 'Lecture',
        chunks: {
          create: parsedChunks.map(chunk => ({
            pageNumber: chunk.pageNumber,
            content: chunk.content
          }))
        }
      }
    });

  } catch (error) {
    console.error('Failed to process document:', error);
    throw new Error('Failed to process document. Please try again.');
  } finally {
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (cleanupErr) {
      console.error('Failed to clean up temp file:', cleanupErr);
    }
  }

  revalidatePath('/study');
}

export async function getDocuments() {
  return await prisma.document.findMany({
    include: {
      chunks: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function deleteDocument(id: string) {
  await prisma.document.delete({
    where: { id }
  });
  revalidatePath('/study');
}

import fs from 'fs';
import path from 'path';
import os from 'os';
import { GoogleGenerativeAI, Schema } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

export async function processPdfWithGemini(
  file: File,
  systemInstruction: string,
  jsonSchema: Schema
) {
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
      displayName: file.name,
    });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
      systemInstruction,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: jsonSchema,
      },
    });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResult.file.mimeType,
          fileUri: uploadResult.file.uri,
        },
      },
    ]);

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    return parsedData;
  } finally {
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (cleanupErr) {
      console.error('Failed to clean up temp file:', cleanupErr);
    }
  }
}

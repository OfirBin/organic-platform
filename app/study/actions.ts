'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function uploadDocument(formData: FormData) {
  const title = formData.get('title') as string;
  const file = formData.get('file') as File;

  if (!title || !file) {
    throw new Error('Title and file are required.');
  }

  // Create document with a dummy chunk
  await prisma.document.create({
    data: {
      title,
      type: 'Lecture',
      chunks: {
        create: [
          { pageNumber: 1, content: "PDF Processing Pending..." }
        ]
      }
    }
  });

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

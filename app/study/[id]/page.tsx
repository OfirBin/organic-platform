import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Layers } from 'lucide-react'

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      chunks: {
        orderBy: {
          pageNumber: 'asc'
        }
      }
    }
  });

  if (!document) {
    notFound();
  }

  return (
    <div className="p-8 w-full max-w-4xl mx-auto space-y-8">
      <header className="space-y-4">
        <Link 
          href="/study" 
          className="inline-flex items-center text-sm font-medium text-sidebar-text hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-brand" />
              {document.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-sidebar-text mt-3 font-medium">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                {document.chunks.length} Pages Processed
              </span>
              <span>•</span>
              <span>{new Date(document.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {document.chunks.length === 0 ? (
          <div className="text-center py-12 bg-sidebar-bg border border-sidebar-border rounded-2xl">
            <p className="text-sidebar-text">No content extracted for this document.</p>
          </div>
        ) : (
          document.chunks.map((chunk) => (
            <article 
              key={chunk.id} 
              className="bg-sidebar-bg border border-sidebar-border rounded-2xl p-8 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-sidebar-border pb-4 mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Page {chunk.pageNumber}
                </h2>
              </div>
              <div className="prose prose-invert max-w-none text-sidebar-foreground">
                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                  {chunk.content}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

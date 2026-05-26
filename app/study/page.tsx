import { getDocuments, uploadDocument, deleteDocument } from './actions'
import { FileText, Upload, BookOpen, Clock, Layers, Trash2 } from 'lucide-react'

export default async function StudyPage() {
  const documents = await getDocuments();

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <BookOpen className="w-8 h-8 text-brand" />
          Knowledge Base
        </h1>
        <p className="text-sidebar-text text-sm">
          Upload your PDF lectures and view your processed library here.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
        
        {/* Left Column: Upload Form */}
        <section className="bg-sidebar-bg border border-sidebar-border rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Upload className="w-5 h-5 text-brand" />
            Upload Lecture
          </h2>
          
          <form action={uploadDocument} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-bold mb-2">Document Title</label>
              <input 
                type="text" 
                id="title"
                name="title" 
                required
                placeholder="e.g., Lecture 5 - Mechanisms"
                className="w-full bg-background border border-sidebar-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>
            
            <div>
              <label htmlFor="file" className="block text-sm font-bold mb-2">PDF File</label>
              <div className="relative">
                <input 
                  type="file" 
                  id="file"
                  name="file" 
                  accept=".pdf"
                  required
                  className="w-full bg-background border border-sidebar-border rounded-xl px-4 py-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 transition-colors cursor-pointer"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 mt-4 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload to Library
            </button>
          </form>
        </section>

        {/* Right Column: Library */}
        <section className="bg-sidebar-bg border border-sidebar-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-brand" />
            Your Library
          </h2>

          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-sidebar-border rounded-xl bg-background/50">
              <FileText className="w-12 h-12 text-sidebar-text/50 mb-4" />
              <p className="text-sidebar-text font-medium">No lectures uploaded yet.</p>
              <p className="text-xs text-sidebar-text/70 mt-1">Upload a PDF on the left to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="p-5 bg-background border border-sidebar-border rounded-xl hover:border-brand/50 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate" title={doc.title}>
                        {doc.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-4 text-xs text-sidebar-text font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                          <span className="bg-sidebar-item-active px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {doc.chunks.length} Chunks
                          </span>
                        </div>
                        <form action={deleteDocument.bind(null, doc.id)}>
                          <button 
                            type="submit" 
                            className="p-1.5 text-sidebar-text/50 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

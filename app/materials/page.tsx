"use client";

import { useState, useRef, useEffect } from "react";
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon,
  Trash2, 
  Send, 
  Bot, 
  User, 
  ShieldAlert,
  Paperclip,
  File
} from "lucide-react";

type UploadedFile = {
  id: string;
  name: string;
  type: string;
  size: string;
};

type ChatMessage = {
  id: string;
  sender: "user" | "bot";
  text: string;
};

export default function MaterialsPage() {
  // File Upload State
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: "1", name: "Organic_Chemistry_Syllabus_2026.pdf", type: "pdf", size: "1.2 MB" },
    { id: "2", name: "Chapter_4_Stereochemistry_Notes.pdf", type: "pdf", size: "3.5 MB" },
    { id: "3", name: "reaction_mechanism_diagram.png", type: "img", size: "850 KB" }
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", sender: "bot", text: "Hello! I am your Course Assistant. I can answer questions based on the materials you've uploaded." }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handlers for File Upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addMockFile(e.dataTransfer.files[0].name);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addMockFile(e.target.files[0].name);
    }
  };

  const addMockFile = (name: string) => {
    const isImage = name.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i);
    const type = isImage ? "img" : "pdf";
    const newFile: UploadedFile = {
      id: Math.random().toString(36).substring(7),
      name: name,
      type: type,
      size: (Math.random() * 5 + 0.1).toFixed(1) + " MB",
    };
    setFiles((prev) => [newFile, ...prev]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Handlers for Chat
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      sender: "user",
      text: inputValue.trim()
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // Mock bot response
    setTimeout(() => {
      const newBotMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        sender: "bot",
        text: "I will search the course documents for your query."
      };
      setMessages((prev) => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 h-[calc(100vh-4rem)] flex flex-col">
      <header>
        <h1 className="text-3xl font-bold mb-2">Study Materials</h1>
        <p className="text-sidebar-text text-sm">
          Upload your documents and chat with the AI Course Assistant to accelerate your learning.
        </p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 pb-4">
        
        {/* LEFT COLUMN: Upload & File List */}
        <div className="lg:col-span-5 flex flex-col gap-6 min-h-0">
          {/* Upload Zone */}
          <div 
            className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
              isDragging 
                ? "border-brand bg-brand/5 scale-[1.02]" 
                : "border-sidebar-border bg-sidebar-bg hover:border-brand/50 hover:bg-sidebar-bg/80"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileInput}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${
              isDragging ? "bg-brand/20 text-brand" : "bg-sidebar-item-active text-sidebar-text"
            }`}>
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Upload Course Materials</h3>
            <p className="text-sm text-sidebar-text mb-4">
              Drag & drop or click to browse
            </p>
            <div className="flex gap-2 items-center text-xs font-medium text-sidebar-text/80 bg-background px-3 py-1.5 rounded-full border border-sidebar-border">
              <FileText className="w-3.5 h-3.5" /> PDF
              <div className="w-1 h-1 rounded-full bg-sidebar-border mx-1" />
              <ImageIcon className="w-3.5 h-3.5" /> JPG / PNG
            </div>
          </div>

          {/* Uploaded Files List */}
          <div className="flex-1 rounded-2xl border border-sidebar-border bg-sidebar-bg flex flex-col min-h-0 shadow-sm">
            <div className="p-4 border-b border-sidebar-border flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-brand" />
              <h3 className="font-semibold">Uploaded Materials</h3>
              <span className="ml-auto bg-brand/10 text-brand text-xs px-2 py-0.5 rounded-full font-medium">
                {files.length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {files.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-sidebar-text p-4 text-center">
                  <File className="w-12 h-12 opacity-20 mb-3" />
                  <p className="text-sm">No materials uploaded yet.</p>
                </div>
              ) : (
                files.map((file) => (
                  <div key={file.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-sidebar-item-hover transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      file.type === "pdf" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                    }`}>
                      {file.type === "pdf" ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                      <p className="text-xs text-sidebar-text">{file.size}</p>
                    </div>
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-sidebar-text hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      aria-label="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Chat Interface */}
        <div className="lg:col-span-7 rounded-2xl border border-sidebar-border bg-sidebar-bg flex flex-col min-h-0 shadow-sm relative overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-sidebar-border bg-sidebar-bg/95 backdrop-blur z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Course Assistant</h2>
                <p className="text-xs text-brand font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online
                </p>
              </div>
            </div>
            
            {/* Disclaimer Badge */}
            <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-3 py-1.5 rounded-lg text-xs font-medium border border-yellow-500/20 max-w-[200px] sm:max-w-none">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate sm:whitespace-normal">Answers are strictly based on uploaded materials</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-background/30">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.sender === "user" ? "bg-sidebar-item-active text-sidebar-text" : "bg-brand text-white"
                }`}>
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm ${
                  msg.sender === "user" 
                    ? "bg-brand text-white rounded-tr-sm shadow-md shadow-brand/10" 
                    : "bg-sidebar-bg border border-sidebar-border rounded-tl-sm shadow-sm"
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-sidebar-bg border border-sidebar-border rounded-tl-sm flex gap-1 items-center">
                  <span className="w-2 h-2 bg-brand/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-brand/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-brand/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-1" />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-sidebar-border bg-sidebar-bg">
            <form 
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 bg-background border border-sidebar-border rounded-xl p-2 focus-within:ring-2 focus-within:ring-brand/50 focus-within:border-brand/50 transition-all shadow-sm"
            >
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your course materials..."
                className="flex-1 bg-transparent border-none focus:outline-none px-2 text-sm"
                disabled={isTyping}
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || isTyping}
                className="p-2.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-[10px] text-sidebar-text mt-2">
              The AI assistant analyzes your active documents to provide context-aware responses.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

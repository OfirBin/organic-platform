'use client';

import { useEffect, useState } from 'react';
import { getStudyQuestions, updateQuestionStat } from './actions';
import Link from 'next/link';
import type { Question, CardStat } from '@prisma/client';

type QuestionWithStat = Question & { stat: CardStat | null };

export default function StudyDashboard() {
  const [questions, setQuestions] = useState<QuestionWithStat[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const data = await getStudyQuestions();
        setQuestions(data);
      } catch (error) {
        console.error('Failed to load questions:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadQuestions();
  }, []);

  const handleGrade = async (isCorrect: boolean) => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    // Optimistically advance to next question
    setShowAnswer(false);
    setCurrentIndex((prev) => prev + 1);

    // Update local stat to immediately reflect in mastery calculation
    setQuestions((prev) => {
      const newQuestions = [...prev];
      const q = newQuestions[currentIndex];
      if (q) {
        const currentStat = q.stat;
        q.stat = {
          ...currentStat,
          id: currentStat?.id || 'temp',
          questionId: q.id,
          timesStudied: (currentStat?.timesStudied || 0) + 1,
          timesCorrect: (currentStat?.timesCorrect || 0) + (isCorrect ? 1 : 0),
          timesIncorrect: (currentStat?.timesIncorrect || 0) + (!isCorrect ? 1 : 0),
          easeFactor: currentStat?.easeFactor || 2.5,
          interval: currentStat?.interval || 0,
          nextReview: currentStat?.nextReview || null,
          lastReviewedAt: currentStat?.lastReviewedAt || null,
        };
      }
      return newQuestions;
    });

    // Update in background
    try {
      await updateQuestionStat(currentQuestion.id, isCorrect);
    } catch (error) {
      console.error('Failed to update stat:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (questions.length === 0 || currentIndex >= questions.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">All Caught Up!</h2>
            <p className="text-slate-600">
              {questions.length === 0 
                ? "There are no questions in the database yet." 
                : "You have reviewed all your pending cards for this session."}
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            {questions.length > 0 && (
              <button 
                onClick={() => setCurrentIndex(0)}
                className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold shadow-md transition-all active:scale-95"
              >
                Review Again
              </button>
            )}
            <Link 
              href="/simulator" 
              className="w-full py-4 px-6 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-semibold transition-all active:scale-95 block"
            >
              Go to Exam Simulator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  
  // Calculate mastery
  let totalStudied = 0;
  let totalCorrect = 0;
  questions.forEach(q => {
    if (q.stat) {
      totalStudied += q.stat.timesStudied;
      totalCorrect += q.stat.timesCorrect;
    }
  });
  
  const masteryPercentage = totalStudied > 0 
    ? Math.round((totalCorrect / totalStudied) * 100) 
    : 0;

  const progressPercentage = Math.round((currentIndex / questions.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center font-sans">
      
      {/* Top Header & Progress */}
      <div className="w-full max-w-3xl mb-8 space-y-5">
        <div className="flex justify-between items-end px-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Study Session</h1>
            <p className="text-sm font-medium text-slate-500 mt-2">Card {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Mastery</p>
            <div className="text-3xl font-black text-indigo-600">{masteryPercentage}%</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className="bg-indigo-500 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden" 
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
          </div>
        </div>
      </div>

      {/* Flashcard Container */}
      <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl shadow-indigo-100/50 overflow-hidden border border-slate-100 transition-all duration-300">
        
        {/* Card Header (Topic & Source) */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-8 py-5 border-b border-indigo-100 flex flex-wrap gap-4 justify-between items-center">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-indigo-100 text-indigo-800 shadow-sm">
            {currentQuestion.topic}
          </span>
          {currentQuestion.sourceExam && (
            <span className="text-sm font-semibold text-slate-500 flex items-center bg-white/60 px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              {currentQuestion.sourceExam}
            </span>
          )}
        </div>

        {/* Card Body */}
        <div className="p-8 sm:p-14 text-center min-h-[320px] flex flex-col justify-center items-center relative bg-white">
          <div className="text-2xl sm:text-3xl font-semibold text-slate-800 leading-snug max-w-2xl">
            {currentQuestion.text}
          </div>
          
          {/* Optional Image Support */}
          {currentQuestion.imageUrl && (
            <div className="mt-8 w-full max-w-lg mx-auto rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
              <img src={currentQuestion.imageUrl} alt="Question figure" className="w-full h-auto object-contain bg-slate-50" />
            </div>
          )}
        </div>

        {/* Divider and Answer Section */}
        {showAnswer && (
          <div className="border-t-2 border-dashed border-slate-200 bg-slate-50 animate-in fade-in slide-in-from-top-8 duration-500">
            <div className="p-8 sm:p-14 text-center">
              <h3 className="text-sm uppercase tracking-widest font-bold text-indigo-400 mb-6 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Answer
              </h3>
              <div className="text-xl sm:text-2xl font-medium text-slate-700 leading-relaxed max-w-2xl mx-auto">
                {currentQuestion.answer}
              </div>
            </div>
          </div>
        )}

        {/* Action Area */}
        <div className="p-6 sm:p-8 bg-slate-100/50 border-t border-slate-100 flex justify-center">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full max-w-md py-4 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              Show Answer
            </button>
          ) : (
            <div className="flex w-full max-w-lg gap-4 sm:gap-6">
              <button
                onClick={() => handleGrade(false)}
                className="flex-1 py-4 px-6 bg-white border-2 border-rose-200 hover:bg-rose-50 text-rose-600 rounded-2xl font-bold text-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                Review
              </button>
              <button
                onClick={() => handleGrade(true)}
                className="flex-1 py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Got It
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

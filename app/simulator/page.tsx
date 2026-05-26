"use client";

import { useState, useEffect } from "react";
import { 
  CheckSquare, 
  Play, 
  Shuffle, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon, 
  CheckCircle2, 
  XCircle,
  Lightbulb,
  Clock,
  Target,
  Settings2,
  Filter,
  ListOrdered,
  RefreshCw
} from "lucide-react";
import { generateExam, getAvailableYears } from "./actions";

type Question = {
  id: string;
  text: string;
  hasImage?: boolean;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

const availableTopics = [
  "Alkanes & Cycloalkanes",
  "Stereochemistry",
  "Nucleophilic Substitution (SN1/SN2)",
  "Elimination Reactions (E1/E2)",
  "Alkenes & Alkynes",
  "Aromaticity",
  "Spectroscopy (NMR/IR)"
];

export default function SimulatorPage() {
  const [phase, setPhase] = useState<"setup" | "exam" | "review">("setup");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [feedbackMode, setFeedbackMode] = useState<"immediate" | "end">("immediate");
  
  // Setup Config State
  const [configLimit, setConfigLimit] = useState<number>(20);
  const [configSource, setConfigSource] = useState<"both" | "real" | "ai">("both");
  const [configYears, setConfigYears] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Exam State
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});

  useEffect(() => {
    getAvailableYears().then(years => {
      setAvailableYears(years);
      setConfigYears(years); // Default all checked
    });
  }, []);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const toggleYear = (year: string) => {
    setConfigYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const handleStartExam = async (isFullRandom: boolean = false) => {
    setIsLoading(true);
    const questions = await generateExam({
      limit: isFullRandom ? 30 : configLimit,
      source: isFullRandom ? "both" : configSource,
      years: isFullRandom ? availableYears : configYears,
      topics: isFullRandom ? availableTopics : selectedTopics
    });
    setExamQuestions(questions);
    setIsLoading(false);
    
    if (questions.length === 0) {
      alert("No questions found matching these filters. Try broadening your selection.");
      return;
    }

    setPhase("exam");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowSolution({});
  };

  const handleSelectAnswer = (option: string) => {
    if (feedbackMode === "immediate" && showSolution[currentQuestionIndex]) return; 
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }));
  };

  const handleSubmitAnswer = () => {
    if (!answers[currentQuestionIndex]) return;
    setShowSolution(prev => ({ ...prev, [currentQuestionIndex]: true }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinishExam = () => {
    setPhase("review");
  };

  // Safe checks if exam is not loaded
  const currentQuestion = examQuestions[currentQuestionIndex];
  const isAnswered = !!answers[currentQuestionIndex];
  const isSolutionShown = feedbackMode === "immediate" && !!showSolution[currentQuestionIndex];
  const isCorrect = currentQuestion && answers[currentQuestionIndex] === currentQuestion.correctAnswer;
  const isLastQuestion = currentQuestionIndex === examQuestions.length - 1;

  // Review screen score logic
  const correctCount = examQuestions.filter((q, idx) => answers[idx] === q.correctAnswer).length;
  const scorePercent = examQuestions.length > 0 ? Math.round((correctCount / examQuestions.length) * 100) : 0;

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 h-[calc(100vh-4rem)] flex flex-col">
      <header className="shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Exam Simulator</h1>
          <p className="text-sidebar-text text-sm">
            Test your knowledge under realistic timed conditions or practice specific topics.
          </p>
        </div>
        {phase === "review" && (
          <div className="bg-brand/10 text-brand px-4 py-2 rounded-xl text-sm font-bold border border-brand/20">
            Final Review
          </div>
        )}
      </header>

      {phase === "setup" && (
        <div className="flex-1 overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 h-full">
            
            {/* Topic & Settings Selection */}
            <section className="flex flex-col gap-6">
              
              {/* Configuration Panel */}
              <div className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Number & Source */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-2">
                      <ListOrdered className="w-4 h-4 text-brand" /> Number of Questions
                    </label>
                    <input 
                      type="number" 
                      min="1" max="100"
                      value={configLimit}
                      onChange={(e) => setConfigLimit(Number(e.target.value) || 20)}
                      className="w-full bg-background border border-sidebar-border rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-2">
                      <Filter className="w-4 h-4 text-brand" /> Source Filter
                    </label>
                    <div className="flex bg-background border border-sidebar-border rounded-xl p-1">
                      {(["both", "real", "ai"] as const).map(src => (
                        <button
                          key={src}
                          onClick={() => setConfigSource(src)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                            configSource === src ? "bg-sidebar-bg shadow text-foreground border border-sidebar-border/50" : "text-sidebar-text hover:text-foreground"
                          }`}
                        >
                          {src}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Years Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-2">
                    <Clock className="w-4 h-4 text-brand" /> Year Filter
                  </label>
                  <div className="bg-background border border-sidebar-border rounded-lg p-2 h-[130px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
                    {availableYears.map(year => (
                      <label key={year} className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-item-hover cursor-pointer transition-colors group">
                        <input 
                          type="checkbox" 
                          checked={configYears.includes(year)}
                          onChange={() => toggleYear(year)}
                          className="appearance-none w-4 h-4 rounded border-2 border-sidebar-text/30 checked:border-brand checked:bg-brand transition-all relative flex items-center justify-center after:content-['✓'] after:absolute after:text-[10px] after:text-white after:opacity-0 checked:after:opacity-100"
                        />
                        <span className="text-sm font-medium text-sidebar-text group-hover:text-foreground">{year} Exams</span>
                      </label>
                    ))}
                    {availableYears.length === 0 && <p className="text-xs text-sidebar-text p-2">Loading years...</p>}
                  </div>
                </div>

              </div>

              {/* Topics Panel */}
              <div className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-5 h-5 text-brand" />
                  <h2 className="text-xl font-bold">Select Topics</h2>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6">
                  {availableTopics.map(topic => (
                    <label 
                      key={topic} 
                      className="flex items-center gap-3 p-3 rounded-xl border border-sidebar-border cursor-pointer hover:bg-sidebar-item-hover transition-colors group"
                    >
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="peer appearance-none w-5 h-5 rounded-md border-2 border-sidebar-text/30 checked:border-brand checked:bg-brand transition-all"
                          checked={selectedTopics.includes(topic)}
                          onChange={() => toggleTopic(topic)}
                        />
                        <CheckSquare className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="font-medium text-sm group-hover:text-foreground transition-colors">
                        {topic}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Feedback Settings */}
              <div className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Settings2 className="w-5 h-5 text-brand" />
                  <h2 className="text-xl font-bold">Feedback Settings</h2>
                </div>
                <div className="flex bg-background border border-sidebar-border rounded-xl p-1">
                  <button
                    onClick={() => setFeedbackMode("immediate")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      feedbackMode === "immediate" ? "bg-sidebar-bg shadow text-foreground border border-sidebar-border/50" : "text-sidebar-text hover:text-foreground"
                    }`}
                  >
                    Immediate Feedback
                  </button>
                  <button
                    onClick={() => setFeedbackMode("end")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      feedbackMode === "end" ? "bg-sidebar-bg shadow text-foreground border border-sidebar-border/50" : "text-sidebar-text hover:text-foreground"
                    }`}
                  >
                    Review at End
                  </button>
                </div>
              </div>

              <button 
                onClick={() => handleStartExam(false)}
                disabled={selectedTopics.length === 0 || isLoading}
                className="w-full py-4 bg-sidebar-item-active text-foreground font-bold rounded-xl hover:bg-brand hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />} Start Custom Practice
              </button>
            </section>

            {/* Full Exam Option */}
            <section className="p-8 rounded-2xl border-2 border-brand/20 bg-brand/5 shadow-sm flex flex-col items-center justify-center text-center h-full">
              <div className="w-20 h-20 bg-brand/20 rounded-full flex items-center justify-center mb-8">
                <Shuffle className="w-10 h-10 text-brand" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Full Random Exam</h2>
              <p className="text-sidebar-text mb-8 text-sm leading-relaxed">
                Simulate a real midterm exam. Questions are drawn randomly from all available topics under a strict time limit.
              </p>
              
              <div className="flex gap-8 mb-10 text-sm font-medium text-sidebar-text">
                <div className="flex flex-col items-center">
                  <Clock className="w-5 h-5 mb-1" />
                  <span>60 Mins</span>
                </div>
                <div className="flex flex-col items-center">
                  <Target className="w-5 h-5 mb-1" />
                  <span>30 Qs</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  setFeedbackMode("end");
                  handleStartExam(true);
                }}
                disabled={isLoading}
                className="w-full py-4 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover hover:scale-[1.02] transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-3"
              >
                {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />} Launch Simulation
              </button>
            </section>
          </div>
        </div>
      )}

      {phase === "exam" && currentQuestion && (
        <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-4 duration-500 relative">
          
          {/* Navigation Bar */}
          <div className="flex items-center justify-between mb-4 shrink-0 bg-sidebar-bg border border-sidebar-border p-3 rounded-xl shadow-sm">
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pr-4 max-w-[70vw] pb-1">
              {examQuestions.map((_, idx) => {
                const isActive = idx === currentQuestionIndex;
                const isAns = !!answers[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`shrink-0 w-8 h-8 rounded-full text-xs font-bold transition-all border ${
                      isActive ? "bg-brand text-white border-brand scale-110" : 
                      isAns ? "bg-brand/10 text-brand border-brand/20" : "bg-background text-sidebar-text border-sidebar-border hover:border-sidebar-text"
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
            <button 
              onClick={() => setPhase("setup")}
              className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors ml-4 shrink-0 px-2"
            >
              Quit Exam
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col xl:flex-row gap-6 pb-4">
            
            {/* Left side: Question & Image */}
            <div className="flex-1 p-8 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm flex flex-col">
              <h3 className="text-xl font-medium leading-relaxed mb-6">
                {currentQuestion.text}
              </h3>
              
              {currentQuestion.hasImage && (
                <div className="w-full h-32 bg-background border border-dashed border-sidebar-border rounded-xl flex flex-col items-center justify-center text-sidebar-text mt-auto">
                  <ImageIcon className="w-8 h-8 opacity-50 mb-2" />
                  <span className="text-sm font-medium">Reaction Scheme Image</span>
                </div>
              )}
            </div>

            {/* Right side: Options & Solution */}
            <div className="flex-[1.2] flex flex-col min-h-0 relative">
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-[100px] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = answers[currentQuestionIndex] === option;
                    const isCorrectOption = option === currentQuestion.correctAnswer;
                    
                    let optionStyle = "border-sidebar-border hover:border-brand/50 bg-sidebar-bg";
                    if (isSelected && !isSolutionShown) {
                      optionStyle = "border-brand bg-brand/5 ring-1 ring-brand shadow-sm";
                    } else if (isSolutionShown) {
                      if (isCorrectOption) {
                        optionStyle = "border-green-500 bg-green-500/10 ring-1 ring-green-500 shadow-sm";
                      } else if (isSelected && !isCorrectOption) {
                        optionStyle = "border-red-500 bg-red-500/10 ring-1 ring-red-500 shadow-sm";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(option)}
                        disabled={isSolutionShown}
                        className={`w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 group ${optionStyle} ${isSolutionShown ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className={`relative w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-brand' : 'border-sidebar-text/50'
                        } ${isSolutionShown && isCorrectOption ? 'border-green-500' : ''} ${isSolutionShown && isSelected && !isCorrectOption ? 'border-red-500' : ''}`}>
                          {isSelected && !isSolutionShown && <div className="w-2.5 h-2.5 bg-brand rounded-full" />}
                          {isSolutionShown && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-green-500 absolute bg-background rounded-full" />}
                          {isSolutionShown && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-red-500 absolute bg-background rounded-full" />}
                        </div>
                        <span className={`font-medium leading-tight flex-1 ${isSolutionShown && isSelected && !isCorrectOption ? 'line-through text-sidebar-text' : ''}`}>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {isSolutionShown && (
                  <div className={`p-5 rounded-2xl border animate-in slide-in-from-bottom-4 fade-in duration-500 mt-6 ${
                    isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full shrink-0 mt-1 ${isCorrect ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/20 text-red-600 dark:text-red-400"}`}>
                        {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className={`text-base font-bold mb-2 ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {isCorrect ? "Correct!" : "Incorrect"}
                        </h4>
                        <div className="bg-background border border-sidebar-border p-3.5 rounded-xl shadow-sm mt-2">
                          <h5 className="font-semibold text-sm flex items-center gap-1.5 mb-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-yellow-500" /> Solution
                          </h5>
                          <p className="text-sm leading-relaxed text-sidebar-text">
                            {currentQuestion.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Pinned at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md pt-4 flex items-center justify-between border-t border-sidebar-border z-10">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="px-5 py-3 flex items-center gap-2 text-sm font-bold text-sidebar-text hover:text-foreground hover:bg-sidebar-item-hover rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex gap-3">
                  {feedbackMode === "immediate" && !isSolutionShown && (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!isAnswered}
                      className="px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      Submit Answer
                    </button>
                  )}

                  {feedbackMode === "end" && isLastQuestion && (
                    <button
                      onClick={handleFinishExam}
                      disabled={Object.keys(answers).length < examQuestions.length}
                      className="px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      Finish & Review
                    </button>
                  )}

                  {!isLastQuestion && (feedbackMode === "end" || isSolutionShown) && (
                    <button
                      onClick={handleNext}
                      className="px-6 py-3 bg-sidebar-item-active text-foreground font-bold rounded-xl hover:bg-sidebar-border transition-colors shadow-sm flex items-center gap-2"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  
                  {isLastQuestion && isSolutionShown && (
                     <button
                      onClick={handleFinishExam}
                      className="px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors shadow-sm"
                    >
                      Finish Exam
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "review" && (
        <div className="flex-1 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-sidebar-bg border border-sidebar-border rounded-2xl p-8 shadow-sm flex flex-col items-center mb-8">
             <h2 className="text-2xl font-bold mb-2">Exam Results</h2>
             <div className="text-5xl font-extrabold text-brand my-6">
                {scorePercent}%
             </div>
             <p className="text-sidebar-text font-medium">
               You correctly answered {correctCount} out of {examQuestions.length} questions.
             </p>
             <button onClick={() => setPhase("setup")} className="mt-8 px-6 py-3 bg-sidebar-item-active text-foreground font-bold rounded-xl hover:bg-sidebar-border transition-colors">
               Return to Setup
             </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Detailed Review</h3>
            {examQuestions.map((q, i) => {
              const userAnswer = answers[i];
              const isCorrect = userAnswer === q.correctAnswer;
              
              return (
                <div key={i} className={`p-6 rounded-xl border ${isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                   <div className="flex items-start gap-4">
                      <div className="shrink-0 mt-1">
                        {isCorrect ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                      </div>
                      <div className="flex-1">
                         <h4 className="font-medium text-lg leading-relaxed mb-4">
                           <span className="text-sidebar-text mr-2">{i + 1}.</span> {q.text}
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                           <div className="p-4 rounded-lg bg-background border border-sidebar-border">
                              <span className="text-sidebar-text font-bold block mb-1">Your Answer:</span>
                              <span className={isCorrect ? "text-green-500 font-medium" : "text-red-500 font-medium line-through"}>
                                {userAnswer || "No Answer Selected"}
                              </span>
                           </div>
                           <div className="p-4 rounded-lg bg-background border border-sidebar-border">
                              <span className="text-sidebar-text font-bold block mb-1">Correct Answer:</span>
                              <span className="text-green-500 font-medium">
                                {q.correctAnswer}
                              </span>
                           </div>
                         </div>
                      </div>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

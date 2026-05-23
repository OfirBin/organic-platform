"use client";

import { useState } from "react";
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
  Settings2
} from "lucide-react";

type Question = {
  id: number;
  text: string;
  hasImage?: boolean;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

const mockQuestions: Question[] = [
  {
    id: 1,
    text: "Predict the major product of the reaction between 2-bromo-2-methylpropane and sodium methoxide (NaOMe) in methanol.",
    hasImage: true,
    options: [
      "2-methoxy-2-methylpropane (SN1)",
      "2-methylpropene (E2)",
      "1-methoxy-2-methylpropane (SN2)",
      "2-methyl-1-propene (E1)"
    ],
    correctAnswer: "2-methylpropene (E2)",
    explanation: "Sodium methoxide is a strong base. The substrate is a tertiary alkyl halide. Tertiary alkyl halides cannot undergo SN2 reactions due to steric hindrance. Therefore, a strong base will favor the E2 elimination pathway, resulting in the formation of the alkene (2-methylpropene) as the major product."
  },
  {
    id: 2,
    text: "Which of the following compounds is aromatic?",
    hasImage: false,
    options: [
      "Cyclopentadiene",
      "Cycloheptatrienyl cation",
      "Cyclobutadiene",
      "Cyclooctatetraene"
    ],
    correctAnswer: "Cycloheptatrienyl cation",
    explanation: "According to Hückel's rule, a molecule must be cyclic, planar, fully conjugated, and have (4n + 2) pi electrons to be aromatic. The cycloheptatrienyl cation (tropylium ion) has 6 pi electrons (4(1) + 2 = 6), is planar, fully conjugated, and cyclic, making it aromatic."
  },
  {
    id: 3,
    text: "Assign the absolute configuration (R/S) to the chiral center in (S)-2-butanol.",
    hasImage: true,
    options: [
      "R",
      "S",
      "Achiral",
      "Meso"
    ],
    correctAnswer: "S",
    explanation: "Priority rules (Cahn-Ingold-Prelog): -OH (1), -CH2CH3 (2), -CH3 (3), -H (4). Drawing the molecule with the lowest priority group (-H) pointing away (dashed bond) reveals that the sequence 1 -> 2 -> 3 is counterclockwise. Counterclockwise corresponds to the 'S' configuration."
  }
];

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
  const [phase, setPhase] = useState<"setup" | "exam">("setup");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [feedbackMode, setFeedbackMode] = useState<"immediate" | "end">("immediate");
  
  // Exam State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});
  const [isExamFinished, setIsExamFinished] = useState(false);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleStartExam = () => {
    setPhase("exam");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowSolution({});
    setIsExamFinished(false);
  };

  const handleSelectAnswer = (option: string) => {
    // Prevent changing answer if solution is shown for immediate mode, or if exam is finished
    if ((feedbackMode === "immediate" && showSolution[currentQuestionIndex]) || isExamFinished) return; 
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: option
    }));
  };

  const handleSubmitAnswer = () => {
    if (!answers[currentQuestionIndex]) return;
    
    setShowSolution(prev => ({
      ...prev,
      [currentQuestionIndex]: true
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinishExam = () => {
    setIsExamFinished(true);
    setCurrentQuestionIndex(0); // go back to start to review
  };

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const isAnswered = !!answers[currentQuestionIndex];
  // Show solution if in immediate mode and submitted, OR if exam is finished (Review at End)
  const isSolutionShown = isExamFinished || (feedbackMode === "immediate" && !!showSolution[currentQuestionIndex]);
  const isCorrect = answers[currentQuestionIndex] === currentQuestion.correctAnswer;
  const isLastQuestion = currentQuestionIndex === mockQuestions.length - 1;

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 h-[calc(100vh-4rem)] flex flex-col">
      <header className="shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Exam Simulator</h1>
          <p className="text-sidebar-text text-sm">
            Test your knowledge under realistic timed conditions or practice specific topics.
          </p>
        </div>
        {phase === "exam" && isExamFinished && (
          <div className="bg-brand/10 text-brand px-4 py-2 rounded-xl text-sm font-bold border border-brand/20">
            Exam Completed - Review Mode
          </div>
        )}
      </header>

      {phase === "setup" && (
        <div className="flex-1 overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            
            {/* Topic & Settings Selection */}
            <section className="flex flex-col gap-6">
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
                <p className="text-xs text-sidebar-text mt-3 text-center">
                  {feedbackMode === "immediate" 
                    ? "Solutions will be shown after each question is submitted."
                    : "Solutions will be hidden until you finish the entire exam."}
                </p>
              </div>

              <button 
                onClick={handleStartExam}
                disabled={selectedTopics.length === 0}
                className="w-full py-4 bg-sidebar-item-active text-foreground font-bold rounded-xl hover:bg-brand hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" /> Start Custom Practice
              </button>
            </section>

            {/* Full Exam Option */}
            <section className="p-8 rounded-2xl border-2 border-brand/20 bg-brand/5 shadow-sm flex flex-col items-center justify-center text-center h-full">
              <div className="w-20 h-20 bg-brand/20 rounded-full flex items-center justify-center mb-8">
                <Shuffle className="w-10 h-10 text-brand" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Full Random Exam</h2>
              <p className="text-sidebar-text mb-8 max-w-md text-lg">
                Simulate a real midterm exam. Questions are drawn randomly from all available topics under a strict time limit.
              </p>
              
              <div className="flex gap-8 mb-10 text-base font-medium">
                <div className="flex flex-col items-center">
                  <Clock className="w-6 h-6 mb-2 text-sidebar-text" />
                  <span>60 Mins</span>
                </div>
                <div className="flex flex-col items-center">
                  <Target className="w-6 h-6 mb-2 text-sidebar-text" />
                  <span>30 Questions</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  setFeedbackMode("end"); // Full exam implies review at end
                  handleStartExam();
                }}
                className="px-10 py-4 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover hover:scale-105 transition-all shadow-lg shadow-brand/20 flex items-center gap-3 text-lg"
              >
                <Play className="w-6 h-6 fill-current" /> Launch Simulation
              </button>
            </section>
          </div>
        </div>
      )}

      {phase === "exam" && (
        <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-4 duration-500">
          
          {/* Progress Header */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <span className="font-semibold text-sm">
              Question {currentQuestionIndex + 1} of {mockQuestions.length}
            </span>
            <div className="flex-1 mx-6 h-2 bg-sidebar-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / mockQuestions.length) * 100}%` }}
              />
            </div>
            <button 
              onClick={() => setPhase("setup")}
              className="text-sm font-medium text-sidebar-text hover:text-foreground transition-colors"
            >
              Exit Exam
            </button>
          </div>

          {/* Question Layout Optimization: grid for wider screen utilization */}
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
            <div className="flex-[1.2] flex flex-col gap-4 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestionIndex] === option;
                  const isCorrectOption = option === currentQuestion.correctAnswer;
                  
                  // Style logic based on solution state
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
                      <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-brand' : 'border-sidebar-text/50'
                      } ${isSolutionShown && isCorrectOption ? 'border-green-500' : ''} ${isSolutionShown && isSelected && !isCorrectOption ? 'border-red-500' : ''}`}>
                        {isSelected && !isSolutionShown && <div className="w-2.5 h-2.5 bg-brand rounded-full" />}
                        {isSolutionShown && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-green-500 absolute bg-background rounded-full" />}
                        {isSolutionShown && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-red-500 absolute bg-background rounded-full" />}
                      </div>
                      <span className={`font-medium leading-tight ${isSolutionShown && isSelected && !isCorrectOption ? 'line-through text-sidebar-text' : ''}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons & Solution Area */}
              <div className="mt-auto flex flex-col gap-4">
                
                {isSolutionShown && (
                  <div className={`p-5 rounded-2xl border animate-in slide-in-from-bottom-4 fade-in duration-500 ${
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

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="px-5 py-3 flex items-center gap-2 text-sm font-bold text-sidebar-text hover:text-foreground hover:bg-sidebar-item-hover rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <div className="flex gap-3">
                    {/* If immediate feedback, show Submit Answer before showing solution */}
                    {feedbackMode === "immediate" && !isSolutionShown && !isExamFinished && (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!isAnswered}
                        className="px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        Submit Answer
                      </button>
                    )}

                    {/* Show Finish Exam if in End Mode and on last question, and exam is not finished */}
                    {feedbackMode === "end" && isLastQuestion && !isExamFinished && (
                      <button
                        onClick={handleFinishExam}
                        className="px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors shadow-sm"
                      >
                        Finish & Review
                      </button>
                    )}

                    {/* Show Next button if we're not on the last question, AND (in End mode OR Solution is shown in Immediate mode) */}
                    {!isLastQuestion && (feedbackMode === "end" || isSolutionShown) && !isExamFinished && (
                      <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-sidebar-item-active text-foreground font-bold rounded-xl hover:bg-sidebar-border transition-colors shadow-sm flex items-center gap-2"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* If Exam is Finished, just regular Next navigation to review */}
                    {isExamFinished && !isLastQuestion && (
                      <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-sidebar-item-active text-foreground font-bold rounded-xl hover:bg-sidebar-border transition-colors shadow-sm flex items-center gap-2"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}

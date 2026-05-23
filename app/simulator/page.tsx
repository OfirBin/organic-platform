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
  Target
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
  
  // Exam State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});

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
  };

  const handleSelectAnswer = (option: string) => {
    if (showSolution[currentQuestionIndex]) return; // Prevent changing answer after submitting
    
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

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const isAnswered = !!answers[currentQuestionIndex];
  const isSolutionShown = !!showSolution[currentQuestionIndex];
  const isCorrect = answers[currentQuestionIndex] === currentQuestion.correctAnswer;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 h-[calc(100vh-4rem)] flex flex-col">
      <header className="shrink-0">
        <h1 className="text-3xl font-bold mb-2">Exam Simulator</h1>
        <p className="text-sidebar-text text-sm">
          Test your knowledge under realistic timed conditions or practice specific topics.
        </p>
      </header>

      {phase === "setup" && (
        <div className="flex-1 overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            
            {/* Topic Selection */}
            <section className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-brand" />
                <h2 className="text-xl font-bold">Select Topics</h2>
              </div>
              <p className="text-sm text-sidebar-text mb-4">
                Choose the specific chapters you want to focus on for this practice session.
              </p>
              
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
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
              
              <button 
                onClick={handleStartExam}
                disabled={selectedTopics.length === 0}
                className="mt-6 w-full py-3 bg-sidebar-item-active text-foreground font-medium rounded-xl hover:bg-brand hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> Start Custom Practice
              </button>
            </section>

            {/* Full Exam Option */}
            <section className="p-8 rounded-2xl border-2 border-brand/20 bg-brand/5 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-brand/20 rounded-full flex items-center justify-center mb-6">
                <Shuffle className="w-8 h-8 text-brand" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Full Random Exam</h2>
              <p className="text-sidebar-text mb-8 max-w-sm">
                Simulate a real midterm exam. Questions are drawn randomly from all available topics under a strict time limit.
              </p>
              
              <div className="flex gap-6 mb-8 text-sm font-medium">
                <div className="flex flex-col items-center">
                  <Clock className="w-5 h-5 mb-1 text-sidebar-text" />
                  <span>60 Mins</span>
                </div>
                <div className="flex flex-col items-center">
                  <Target className="w-5 h-5 mb-1 text-sidebar-text" />
                  <span>30 Questions</span>
                </div>
              </div>

              <button 
                onClick={handleStartExam}
                className="px-8 py-3.5 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover hover:scale-105 transition-all shadow-lg shadow-brand/20 flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" /> Launch Simulation
              </button>
            </section>
          </div>
        </div>
      )}

      {phase === "exam" && (
        <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-4 duration-500">
          
          {/* Progress Header */}
          <div className="flex items-center justify-between mb-6 shrink-0">
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

          {/* Question Card */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 space-y-6">
            <div className="p-8 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm">
              <h3 className="text-xl font-medium leading-relaxed mb-6">
                {currentQuestion.text}
              </h3>
              
              {currentQuestion.hasImage && (
                <div className="w-full h-48 bg-background border border-dashed border-sidebar-border rounded-xl flex flex-col items-center justify-center text-sidebar-text mb-8">
                  <ImageIcon className="w-8 h-8 opacity-50 mb-2" />
                  <span className="text-sm font-medium">Reaction Scheme Image Placeholder</span>
                </div>
              )}

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestionIndex] === option;
                  const isCorrectOption = option === currentQuestion.correctAnswer;
                  
                  // Style logic based on solution state
                  let optionStyle = "border-sidebar-border hover:border-brand/50 bg-background";
                  if (isSelected && !isSolutionShown) {
                    optionStyle = "border-brand bg-brand/5 ring-1 ring-brand";
                  } else if (isSolutionShown) {
                    if (isCorrectOption) {
                      optionStyle = "border-green-500 bg-green-500/10 ring-1 ring-green-500";
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle = "border-red-500 bg-red-500/10 ring-1 ring-red-500";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={isSolutionShown}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${optionStyle} ${isSolutionShown ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-brand' : 'border-sidebar-text/50'
                        } ${isSolutionShown && isCorrectOption ? 'border-green-500' : ''} ${isSolutionShown && isSelected && !isCorrectOption ? 'border-red-500' : ''}`}>
                          {isSelected && !isSolutionShown && <div className="w-2.5 h-2.5 bg-brand rounded-full" />}
                          {isSolutionShown && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-green-500 absolute bg-background rounded-full" />}
                          {isSolutionShown && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-red-500 absolute bg-background rounded-full" />}
                        </div>
                        <span className={`font-medium ${isSolutionShown && isSelected && !isCorrectOption ? 'line-through text-sidebar-text' : ''}`}>
                          {option}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions & Solution Box */}
            <div className="flex flex-col gap-6">
              {!isSolutionShown ? (
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!isAnswered}
                    className="px-6 py-3 bg-brand text-white font-medium rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Submit Answer
                  </button>
                </div>
              ) : (
                <div className={`p-6 rounded-2xl border animate-in slide-in-from-top-4 fade-in duration-500 ${
                  isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full shrink-0 mt-1 ${isCorrect ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/20 text-red-600 dark:text-red-400"}`}>
                      {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold mb-2 ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {isCorrect ? "Correct!" : "Incorrect"}
                      </h4>
                      <div className="bg-background border border-sidebar-border p-4 rounded-xl shadow-sm mt-3">
                        <h5 className="font-semibold text-sm flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" /> Step-by-Step Solution
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
          </div>

          {/* Navigation */}
          <div className="pt-4 border-t border-sidebar-border flex items-center justify-between shrink-0">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-sidebar-text hover:text-foreground hover:bg-sidebar-item-hover rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Question
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestionIndex === mockQuestions.length - 1}
              className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-sidebar-text hover:text-foreground hover:bg-sidebar-item-hover rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
            >
              Next Question <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
}

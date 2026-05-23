"use client";

import { useState } from "react";
import { BookOpen, Target, BrainCircuit, GraduationCap, Clock, Award } from "lucide-react";

type TimeFilter = "all_time" | "current_session";

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all_time");

  // Mock Data
  const metricsData = {
    all_time: [
      { id: 1, label: "Exams Completed", value: "24", icon: Target, trend: "+3 this week" },
      { id: 2, label: "Average Score", value: "82%", icon: GraduationCap, trend: "+5% vs last month" },
      { id: 3, label: "Flashcards Mastered", value: "1,240", icon: BrainCircuit, trend: "+120 this week" },
    ],
    current_session: [
      { id: 1, label: "Exams Completed", value: "1", icon: Target, trend: "Just now" },
      { id: 2, label: "Average Score", value: "88%", icon: GraduationCap, trend: "Above average" },
      { id: 3, label: "Flashcards Mastered", value: "45", icon: BrainCircuit, trend: "In 2 hours" },
    ]
  };

  const topicsData = {
    all_time: [
      { id: 1, name: "SN1 & SN2 Reactions", progress: 40, color: "bg-red-500" },
      { id: 2, name: "Stereochemistry", progress: 55, color: "bg-orange-500" },
      { id: 3, name: "Alkenes & Alkynes", progress: 68, color: "bg-yellow-500" },
      { id: 4, name: "Alkanes Naming", progress: 85, color: "bg-green-500" },
    ],
    current_session: [
      { id: 1, name: "E1 & E2 Reactions", progress: 30, color: "bg-red-500" },
      { id: 2, name: "Carbocations", progress: 50, color: "bg-orange-500" },
    ]
  };

  const currentMetrics = metricsData[timeFilter];
  const currentTopics = topicsData[timeFilter];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header & Toggle */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-sidebar-text text-sm">Welcome back! Continue your organic chemistry journey.</p>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex items-center bg-sidebar-bg border border-sidebar-border rounded-full p-1 shadow-sm">
          <button
            onClick={() => setTimeFilter("all_time")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              timeFilter === "all_time" 
                ? "bg-brand text-white shadow-md" 
                : "text-sidebar-text hover:text-foreground"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeFilter("current_session")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              timeFilter === "current_session" 
                ? "bg-brand text-white shadow-md" 
                : "text-sidebar-text hover:text-foreground"
            }`}
          >
            Current Session
          </button>
        </div>
      </header>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div 
              key={metric.id} 
              className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm hover:shadow-md hover:border-brand/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-brand/10 text-brand group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-sidebar-text bg-sidebar-item-active px-2 py-1 rounded-full">
                  {metric.trend}
                </span>
              </div>
              <p className="text-sidebar-text text-sm font-medium mb-1">{metric.label}</p>
              <h2 className="text-3xl font-bold">{metric.value}</h2>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weakest Topics */}
        <section className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-brand" />
            <h2 className="text-xl font-bold">Topics to Review</h2>
          </div>
          
          <div className="space-y-6">
            {currentTopics.map((topic) => (
              <div key={topic.id} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{topic.name}</span>
                  <span className="text-sidebar-text font-bold">{topic.progress}%</span>
                </div>
                <div className="w-full bg-sidebar-item-active rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${topic.color}`} 
                    style={{ width: `${topic.progress}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions or Recent Activity Placeholder */}
        <section className="p-6 rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-brand" />
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-sidebar-border rounded-xl">
            <Award className="w-12 h-12 text-sidebar-text/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
            <p className="text-sm text-sidebar-text max-w-xs">
              Start a new study session or complete an exam to see your activity here.
            </p>
            <button className="mt-6 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover transition-colors shadow-sm">
              Start Learning
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Dna, 
  GraduationCap, 
  Layers, 
  BookA 
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Study Materials", href: "/materials", icon: BookOpen },
  { name: "Structure Explorer", href: "/explorer", icon: Dna },
  { name: "Exam Simulator", href: "/simulator", icon: GraduationCap },
  { name: "Flashcards", href: "/flashcards", icon: Layers },
  { name: "Glossary", href: "/glossary", icon: BookA },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-sidebar-bg border-r border-sidebar-border h-full transition-colors duration-200">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-xl">
          O
        </div>
        <span className="font-semibold text-lg tracking-tight text-foreground">OrganicEdu</span>
      </div>
      
      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? "bg-sidebar-item-active text-sidebar-text-active"
                  : "text-sidebar-text hover:bg-sidebar-item-hover hover:text-sidebar-text-active"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border flex items-center justify-between">
        <div className="text-sm font-medium text-sidebar-text px-2">Theme</div>
        <ThemeToggle />
      </div>
    </div>
  );
}

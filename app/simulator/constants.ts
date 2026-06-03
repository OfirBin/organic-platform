export const availableTopics = [
  "Alkanes & Cycloalkanes",
  "Stereochemistry",
  "Nucleophilic Substitution (SN1/SN2)",
  "Elimination Reactions (E1/E2)",
  "Alkenes & Alkynes",
  "Aromaticity",
  "Spectroscopy (NMR/IR)"
];

export type ExamConfig = {
  limit: number;
  source: "real" | "ai" | "both";
  years: string[];
  topics: string[];
};

export interface ResumeRule {
  rule: string;
  category: string;
  weight: number;
  penalty: number;
  weighted_penalty?: number;
  note: string;
  suggestion: string;
  trigger?: string | null;
  keywords?: string | null;
}

export interface ResumeSummary {
  total_weighted_penalty: number;
  max_possible_penalty: number;
  final_score: number;
  grade: string;
  overview: string;
  top_3_actionable_fixes: string[];
}

export interface ResumeResult {
  rules: ResumeRule[];
  summary: ResumeSummary;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost?: number;
}

export interface ScoreCardProps {
  summary?: {
    final_score?: number;
    grade?: string;
    overview?: string;
    top_3_actionable_fixes?: string[];
  };
}

export type ScoreRule = {
  rule: string;
  category: string;
  weight: number;
  penalty: number;
  weighted_penalty: number;
  note: string;
  suggestion: string;
  trigger: any;
  keywords?: string;
};

export interface RuleBreakdownProps {
  rules: Rule[];
}
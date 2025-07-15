import { OpenAI } from 'openai';
import { promptText } from '@/prompt/pr';
import { rules } from '@/prompt/rulests';
import { summary } from '@/prompt/summary';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 5 rule groups
const ruleGroups = [
  rules.slice(0, 7),    // Keyword relevance
  rules.slice(7, 13),   // Structure
  rules.slice(13, 16),  // Experience
  rules.slice(16, 24),  // Writing style
  rules.slice(24, 28)   // Formatting
];

// Prompt builder per group
function buildPromptSubset(groupRules, resumeText) {
  return `
${promptText}

Analyze ONLY the following rules:
${JSON.stringify(groupRules, null, 2)}

- Do not include a summary.
- Do not return any extra text, commentary, or markdown.
- Respond ONLY with a JSON array of rule objects using this format:
[
  {
    "rule": "string",
    "category": "string",
    "weight": integer,
    "penalty": integer,
    "weighted_penalty": integer,
    "note": "string",
    "suggestion": "string",
    "trigger": "string|null",
    "keywords": "string|null"
  }
]

Resume:
${resumeText}
`.trim();
}

// GPT rule evaluator with retry + token logging
async function evaluateRuleGroup(groupRules, resumeText, maxRetries = 2) {
  const prompt = buildPromptSubset(groupRules, resumeText);
  await new Promise((r) => setTimeout(r, 50));
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a strict resume evaluator trained in ATS-based rules. Respond with valid JSON only. No extra text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.0
      });

      const raw = response.choices?.[0]?.message?.content?.trim();
      const clean = raw?.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (!Array.isArray(parsed)) throw new Error("Expected an array of rule objects.");

      const usage = response.usage || {};
      return { rules: parsed, tokens: usage };

    } catch (err) {
      console.warn(`GPT parse failed (attempt ${attempt + 1}):`, err.message);
      if (attempt === maxRetries) throw new Error("Max retries reached for rule group.");
    }
  }
}

// Generate 1-sentence summary from 28 rules
async function generateOverviewWithGPT(ruleObjects) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a strict resume evaluator. Given 28 rule objects with penalties and notes, generate a 1-sentence summary of resume quality. Be objective, specific, and use professional tone.'
      },
      {
        role: 'user',
        content: `Here are the rule evaluations:\n${JSON.stringify(ruleObjects, null, 2)}\n\nReturn only the 1-sentence summary. No formatting.`
      }
    ],
    temperature: 0.3
  });

  const raw = response.choices?.[0]?.message?.content?.trim();
  return raw?.replace(/^["']|["']$/g, '') || "Evaluation complete based on 28-point rubric.";
}

// MAIN HANDLER
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed. Use POST.' });

  const { resumeText } = req.body;
  if (!resumeText || typeof resumeText !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing resumeText.' });
  }

  try {
    // Evaluate all rule groups in parallel
    const allResults = await Promise.all(
      ruleGroups.map((group) => evaluateRuleGroup(group, resumeText))
    );

    const allRules = allResults.flatMap(r => r.rules);
    const allTokenUsage = allResults.map(r => r.tokens);

    const totalWeightedPenalty = allRules.reduce(
      (sum, r) => sum + (r.weighted_penalty || (r.penalty * r.weight)),
      0
    );

    const maxPossiblePenalty = 820;
    const finalScore = +(100 - (totalWeightedPenalty / maxPossiblePenalty) * 100).toFixed(1);

    const grade =
      finalScore >= 90 ? 'Excellent' :
      finalScore >= 75 ? 'Strong' :
      finalScore >= 60 ? 'Fair' :
      finalScore >= 40 ? 'Weak' : 'Needs Work';

    const topFixes = allRules
      .sort((a, b) => b.weighted_penalty - a.weighted_penalty)
      .slice(0, 3)
      .map(r => r.suggestion);

    const overview = await generateOverviewWithGPT(allRules);

    const summaryResult = {
      total_weighted_penalty: totalWeightedPenalty,
      max_possible_penalty: maxPossiblePenalty,
      final_score: finalScore,
      grade,
      overview,
      top_3_actionable_fixes: topFixes
    };

    const totalTokens = allTokenUsage.reduce((acc, u) => ({
      prompt_tokens: acc.prompt_tokens + (u.prompt_tokens || 0),
      completion_tokens: acc.completion_tokens + (u.completion_tokens || 0),
      total_tokens: acc.total_tokens + (u.total_tokens || 0),
    }), { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 });

    return res.status(200).json({
      result: {
        rules: allRules,
        summary: summaryResult
      },
      usage: totalTokens
    });

  } catch (error) {
    console.error("Resume evaluation error:", error);
    return res.status(500).json({ error: 'Failed to evaluate resume.', detail: error.message });
  }
}

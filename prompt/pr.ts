export const promptText = `
Your task is to evaluate the following resume using a strict 28-rule framework and return a transparent JSON result by calling the \`evaluate_resume\` function.

Evaluation Instructions:
- Review the resume against each of the 28 rules in the json template.
- For each rule, assign a penalty (0–10) based on the 'evaluation_guideline'.
- Fill in: \`penalty\`, \`note\`, \`suggestion\`, \`trigger\` (phrase found or "Section not found"), and \`keywords\` (if relevant).
- Compute \`weighted_penalty = penalty × weight\`.
- Do not leave any rule empty, even if the content is missing.

Summary Instructions:
- Calculate \`total_weighted_penalty = sum of weighted penalties\`.
- Use fixed \`max_possible_penalty = 820\`.
- Compute final_score: \`100 - (total_weighted_penalty / 820 × 100)\`, rounded to 1 decimal.
- Determine grade:
  - 90–100: "Excellent"
  - 75–89: "Strong"
  - 60–74: "Fair"
  - 40–59: "Weak"
  - <40: "Needs Work"
- Write a one-line \`overview\` of resume quality.
- List the \`top_3_actionable_fixes\` (most impactful, specific improvements).

Output your result using a function call to \`evaluate_resume\`, passing:
- \`rules\`: An array of 28 rule objects
- \`summary\`: The final summary object

Penalty Scale:
0 = Fully meets the rule  
1–2 = Minor issue  
3–4 = Somewhat lacking  
5–6 = Noticeably flawed  
7–8 = Major issue  
9–10 = Critical or completely missing

Make sure your response is strictly JSON-compatible for function call execution.
`;

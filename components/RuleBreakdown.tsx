'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ScoreRule, RuleBreakdownProps } from '@/types/resume';

export default function RuleBreakdown({ rules }: RuleBreakdownProps) {
  const [selectedRule, setSelectedRule] = useState<ScoreRule | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  if (!Array.isArray(rules)) return <p>No rules found.</p>;

  const grouped = rules.reduce<Record<string, ScoreRule[]>>((acc, rule) => {
    acc[rule.category] = acc[rule.category] || [];
    acc[rule.category].push(rule);
    return acc;
  }, {});

  const handleToggle = (category: string) => {
    setOpenCategory(prev => (prev === category ? null : category));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left column: Accordion */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, rules]) => (
          <div key={category} className="border rounded border-gray-200 dark:border-gray-700">
            <button
              className="w-full flex justify-between items-center text-left p-3 font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => handleToggle(category)}
            >
              <span>{category}</span>
              <ChevronDown
                className={`transition-transform duration-300 ${
                  openCategory === category ? 'rotate-180' : ''
                }`}
                size={20}
              />
            </button>

            {openCategory === category && (
              <ul className="p-2 space-y-1 bg-white dark:bg-gray-900">
                {rules.map((rule, idx) => (
                  <li
                    key={idx}
                    className={`cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      selectedRule === rule
                        ? 'bg-gray-200 dark:bg-gray-600'
                        : ''
                    }`}
                    onClick={() => setSelectedRule(rule)}
                  >
                    {rule.rule}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Right column: Detail view */}
      <div className="p-4 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 shadow text-gray-900 dark:text-gray-100">
        {selectedRule ? (
          <div>
            <h3 className="text-xl font-semibold mb-2">{selectedRule.rule}</h3>
            <p><strong>Penalty:</strong> {selectedRule.penalty} × {selectedRule.weight} = {selectedRule.weighted_penalty}</p>
            <p><strong>Note:</strong> {selectedRule.note}</p>
            <p><strong>Suggestion:</strong> {selectedRule.suggestion}</p>
            <p><strong>Trigger:</strong> {JSON.stringify(selectedRule.trigger)}</p>
            <p><strong>Keywords:</strong> {selectedRule.keywords || '—'}</p>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">Click a rule to see details.</p>
        )}
      </div>
    </div>
  );
}

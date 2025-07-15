'use client';

import { useEffect, useState } from 'react';
import type { ScoreCardProps } from '@/types/resume';

export default function ScoreCard({ summary }: ScoreCardProps) {
  const {
    final_score = 0,
    grade = '—',
    overview: summaryText = '—',
    top_3_actionable_fixes = [],
  } = summary || {};

  const score = Math.round(Math.min(Math.max(final_score, 0), 100));
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const match = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(match.matches);
      match.addEventListener('change', (e) => setIsDark(e.matches));
    }
  }, []);

  const getColor = (score: number): string => {
    if (score < 50) return isDark ? '#f87171' : '#ef4444'; // red-400 / red-500
    if (score < 75) return isDark ? '#facc15' : '#f59e0b'; // yellow-400 / yellow-500
    return isDark ? '#34d399' : '#10b981'; // green-400 / green-500
  };

  const radius = 50;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="my-6 p-4 bg-white dark:bg-gray-800 shadow rounded text-gray-900 dark:text-gray-100">
      <h2 className="text-xl font-semibold mb-4">Score Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="flex items-center justify-center h-40">
          <svg height={radius * 2} width={radius * 2}>
            {/* Background */}
            <circle
              stroke="#e5e7eb"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress */}
            <circle
              stroke={getColor(score)}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              transform={`rotate(-90 ${radius} ${radius})`}
            />
            {/* Score Text */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="currentColor"
              fontSize="20"
              fontWeight="bold"
            >
              {score}
            </text>
          </svg>
        </div>

        {/* Right column: Summary */}
        <div className="flex flex-col justify-center">
          <p className="mb-2"><strong>Grade:</strong> {grade}</p>
          <p className="mb-2"><strong>Overview:</strong> {summaryText}</p>
          {top_3_actionable_fixes.length > 0 ? (
            <div>
              <p className="font-medium">Top 3 Actionable Fixes:</p>
              <ul className="list-disc ml-5 mt-1">
                {top_3_actionable_fixes.map((fix, i) => (
                  <li key={i}>{fix}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic mt-2">
              No actionable fixes listed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

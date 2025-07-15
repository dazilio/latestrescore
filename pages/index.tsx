import { useState, useEffect } from "react";
import UploadBox from "@/components/UploadBox";
import ScoreCard from "@/components/ScoreCard";
import RuleBreakdown from "@/components/RuleBreakdown";
import { Loader2, Moon, Sun } from "lucide-react";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [usage, setUsage] = useState(null);
  const [cost, setCost] = useState(0);
  const [category, setCategory] = useState<string | null>(null);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark = saved === "dark" || (!saved && prefersDark);
    setDark(isDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    if (!loading) {
      setTimer(0);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <main className="p-6 sm:p-8 max-w-4xl mx-auto dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-800 dark:text-white">
          Resume Score
        </h1>
        <button
          onClick={() => setDark((d) => !d)}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle dark mode"
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      <UploadBox
        setResult={setResult}
        setLoading={setLoading}
        setUsage={setUsage}
        setCost={setCost}
        setCategory={setCategory}
      />

      {loading && (
        <div className="mt-10 flex flex-col items-center text-gray-600 dark:text-gray-300">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500 mb-2" />
          <p>
            Processing... <strong>{timer}s</strong>
          </p>
          {category &&
            (category === "Finalize" ? (
              <p className="text-sm mt-1 italic text-blue-400">
                Finishing up...
              </p>
            ) : (
              <p className="text-sm mt-1">
                Analyzing: <em>{category}</em>
              </p>
            ))}
        </div>
      )}

      {result && !loading && (
        <div className="mt-10 space-y-6">
          <ScoreCard summary={{ ...result.summary, usage, cost }} />
          <RuleBreakdown rules={result.rules} />
        </div>
      )}
    </main>
  );
}

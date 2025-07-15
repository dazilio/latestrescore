import { useCallback, useRef, useState } from "react";
import type { ResumeResult } from "@/types/resume";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.entry";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

type UploadBoxProps = {
  setResult: (result: ResumeResult | null) => void;
  setLoading: (loading: boolean) => void;
  setUsage: (usage: any) => void;
  setCost: (cost: number) => void;
  setCategory: (category: string | null) => void;
};

const categories = [
  "Keyword Relevance",
  "Resume Structure",
  "Work Experience",
  "Readability",
  "Formatting",
  "Finalize"
];

export default function UploadBox({
  setResult,
  setLoading,
  setUsage,
  setCost,
  setCategory,
}: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };
  function animateCategories() {
    (async () => {
      for (const category of categories) {
        setCategory(category);
        await new Promise((r) => setTimeout(r, 2000)); // 3s per category
      }
    })();
  }

  async function handleFile(file: File) {
    setLoading(true);
    setResult(null);

    try {
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length < 10) {
        alert("Unable to extract meaningful content.");
        return;
      }

      // Fire category animation, but don't await
      animateCategories();

      // Start actual resume parse
      const parsed = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text }),
      }).then((r) => r.json());

      const { result, usage, cost_usd } = parsed;
      let resultObj: ResumeResult =
        typeof result === "string" ? JSON.parse(result) : result;

      if (!resultObj.rules || !resultObj.summary) {
        alert("Missing rules or summary.");
        return;
      }

      setResult(resultObj);
      setUsage(usage);
      setCost(cost_usd);
    } catch (err) {
      console.error(err);
      alert("Processing failed.");
    } finally {
      setLoading(false);
      setCategory(null);
    }
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-md p-6 text-center transition-colors duration-200
      ${
        isDragging
          ? "bg-blue-100 dark:bg-blue-900 border-blue-400"
          : "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
      }
    `}
    >
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      <p className="text-gray-700 dark:text-gray-200 mb-2">
        Drag and drop your resume here, or{" "}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
        >
          browse
        </button>
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Accepted formats: PDF, DOCX
      </p>
    </div>
  );
}

async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      text += pageText + "\n";
    }
    return text;
  } else if (file.name.endsWith(".docx")) {
    const buffer = await file.arrayBuffer();
    const { value } = await mammoth.convertToPlainText({ arrayBuffer: buffer });
    return value;
  }
  throw new Error("Unsupported file format");
}

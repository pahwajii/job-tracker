import { useState, useEffect } from "react"
import { api } from "../services/api"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [file, setFile] = useState(null)
  
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadMessage, setUploadMessage] = useState({ text: "", type: "" })
  const [analysisError, setAnalysisError] = useState("")

  const [results, setResults] = useState(null) // { matchScore, missingKeywords: [], tailoringSuggestions: [] }

  // Load user's cached resume text on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.resumeText) {
        setResumeText(user.resumeText)
        setUploadMessage({ text: "Loaded previously uploaded resume text.", type: "success" })
      }
    }
  }, [])

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setUploadMessage({ text: "", type: "" })
  }

  const handleUploadResume = async (e) => {
    e.preventDefault()
    if (!file) {
      setUploadMessage({ text: "Please select a PDF file first.", type: "error" })
      return
    }

    setUploading(true)
    setUploadMessage({ text: "", type: "" })

    const formData = new FormData()
    formData.append("resume", file)

    try {
      const data = await api.uploadResume(formData)
      
      // Update cached state
      setResumeText(data.resumeText || "")
      
      // Update user in localStorage
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        user.resumeText = data.resumeText || ""
        localStorage.setItem("user", JSON.stringify(user))
      }

      setUploadMessage({ text: "Resume uploaded and text extracted successfully!", type: "success" })
      setFile(null)
    } catch (err) {
      console.error(err)
      setUploadMessage({ text: err.message || "Failed to upload resume. Ensure it is a valid PDF.", type: "error" })
    } finally {
      setUploading(false)
    }
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    setAnalysisError("")
    setResults(null)

    if (!jobDescription.trim()) {
      setAnalysisError("Job description is required for analysis.")
      return
    }

    setAnalyzing(true)
    try {
      const analysis = await api.analyzeResume(resumeText, jobDescription)
      setResults(analysis)
    } catch (err) {
      console.error(err)
      setAnalysisError(err.message || "Analysis failed. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  // Helper for match score color classes
  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/40"
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/40"
    return "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/40"
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 transition-colors duration-300">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-950 dark:text-white mb-2 tracking-tight">🔍 AI Resume Analyzer</h1>
        <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">Compare your resume against any job description to view match scores, extract missing keywords, and get custom tailored suggestions.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Input Controls */}
        <div className="space-y-6">
          {/* Resume Upload Form */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 tracking-tight">
              📄 1. Upload Resume (PDF)
            </h2>
            
            <form onSubmit={handleUploadResume} className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-slate-800 rounded-xl cursor-pointer bg-gray-50/50 dark:bg-slate-900/30 hover:bg-gray-50 dark:hover:bg-slate-900/50 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="text-3xl mb-2">📤</span>
                    <p className="text-xs text-gray-500 dark:text-slate-450 font-bold">
                      {file ? file.name : "Click to select resume PDF (Max 5MB)"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {uploadMessage.text && (
                <div className={`p-3 rounded-lg text-xs font-bold ${uploadMessage.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"}`}>
                  {uploadMessage.text}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5"
                disabled={!file}
                loading={uploading}
              >
                Upload & Extract
              </Button>
            </form>

            <div className="pt-2">
              <Input
                label="Resume Text (Direct Edit / Preview)"
                id="resumeText"
                as="textarea"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Upload your resume above or paste your raw resume text here directly..."
                className="h-32"
              />
            </div>
          </Card>

          {/* Job Description Form */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 tracking-tight">
              💼 2. Job Description
            </h2>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <Input
                id="jobDescription"
                as="textarea"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                className="h-48"
                required
              />

              {analysisError && (
                <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-xs font-semibold border-l-4 border-red-500">
                  {analysisError}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                loading={analyzing}
              >
                ✨ Run AI Analysis
              </Button>
            </form>
          </Card>
        </div>

        {/* Results Panel */}
        <Card className="p-6 min-h-[500px]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
            📊 Analysis Report
          </h2>

          {!results && !analyzing && (
            <div className="flex flex-col items-center justify-center text-center h-[350px] text-gray-400 dark:text-slate-550">
              <span className="text-5xl mb-4">🎯</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-200">Your report will generate here.</p>
              <p className="text-xs mt-1 text-gray-500 dark:text-slate-400">Upload a resume, paste a job description, and click "Run AI Analysis".</p>
            </div>
          )}

          {analyzing && (
            <div className="flex flex-col items-center justify-center text-center h-[350px] space-y-4">
              <span className="animate-spin inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full" />
              <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">Google Gemini AI is processing your resume...</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 max-w-xs leading-relaxed">We are parsing key competencies, matching attributes, and identifying skill gaps.</p>
            </div>
          )}

          {results && (
            <div className="space-y-6 animate-fadeIn">
              {/* Score Display */}
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-black ${getScoreColor(results.matchScore)}`}>
                  {results.matchScore}%
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-850 dark:text-slate-100">Match Compatibility</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {results.matchScore >= 80 
                      ? "Excellent fit! Your resume is strongly aligned with this role."
                      : results.matchScore >= 50
                      ? "Good potential. Consider tailoring your resume with missing keywords to boost your match rate."
                      : "Weak match. Significant updates or highlighting transferrable skills might be necessary."}
                  </p>
                </div>
              </div>

              {/* Missing Keywords */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-slate-350 mb-2.5 uppercase tracking-wider">Missing Keywords / Skill Gaps</h3>
                <div className="flex flex-wrap gap-2">
                  {results.missingKeywords && results.missingKeywords.length > 0 ? (
                    results.missingKeywords.map((word, i) => (
                      <span key={i} className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 font-bold px-3 py-1.5 rounded-xl text-xs border border-amber-100 dark:border-amber-900/40">
                        {word}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-green-600 dark:text-green-400 italic">No major missing keywords found. Great job!</span>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-slate-350 mb-2.5 uppercase tracking-wider">Actionable Resume Enhancements</h3>
                <ul className="space-y-3">
                  {results.tailoringSuggestions && results.tailoringSuggestions.map((tip, i) => (
                    <li key={i} className="flex gap-2.5 text-xs text-gray-600 dark:text-slate-300 leading-relaxed items-start">
                      <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✔</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

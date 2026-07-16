import { useState, useEffect } from "react"
import { api } from "../services/api"
import useAsync from "../hooks/useAsync"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import FileUpload from "../components/ui/FileUpload"
import LoadingSpinner from "../components/ui/LoadingSpinner"

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState({ text: "", type: "" })

  // Use useAsync hook to manage parsing/analysis async states
  const uploadAsync = useAsync(api.uploadResume)
  const analyzeAsync = useAsync(api.analyzeResume)

  // Load user's cached resume text on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.resumeText) {
        setResumeText(user.resumeText)
        setMessage({ text: "Loaded previously uploaded resume text.", type: "success" })
      }
    }
  }, [])

  const handleUploadResume = async (e) => {
    if (e) e.preventDefault()
    if (!file) return

    setMessage({ text: "", type: "" })

    const formData = new FormData()
    formData.append("resume", file)

    try {
      const data = await uploadAsync.execute(formData)
      
      // Update local state
      setResumeText(data.resumeText || "")
      
      // Update cache
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        user.resumeText = data.resumeText || ""
        localStorage.setItem("user", JSON.stringify(user))
      }

      setMessage({ text: "Resume uploaded and text extracted successfully!", type: "success" })
      setFile(null)
    } catch (err) {
      setMessage({ text: err.message || "Failed to parse PDF.", type: "error" })
    }
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!jobDescription.trim()) return
    
    try {
      await analyzeAsync.execute(resumeText, jobDescription)
    } catch (err) {
      console.error(err)
    }
  }

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
        {/* Input Panel */}
        <div className="space-y-6">
          {/* Resume Upload section using new FileUpload */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 tracking-tight">
              📄 1. Upload Resume (PDF)
            </h2>
            
            <div className="space-y-4">
              <FileUpload
                onFileSelect={setFile}
                uploading={uploadAsync.loading}
                accept=".pdf"
                helperText="Select or drag resume PDF file here (Max 5MB)"
              />

              {message.text && (
                <div className={`p-3 rounded-lg text-xs font-bold ${message.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"}`}>
                  {message.text}
                </div>
              )}

              {file && (
                <Button
                  variant="primary"
                  className="w-full py-2.5"
                  onClick={handleUploadResume}
                  loading={uploadAsync.loading}
                >
                  Upload & Extract
                </Button>
              )}
            </div>

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

          {/* Job Description Card */}
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

              {analyzeAsync.error && (
                <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-xs font-semibold border-l-4 border-red-500">
                  {analyzeAsync.error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                loading={analyzeAsync.loading}
                disabled={!resumeText.trim()}
              >
                ✨ Run AI Analysis
              </Button>
            </form>
          </Card>
        </div>

        {/* Results Card */}
        <Card className="p-6 min-h-[500px]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
            📊 Analysis Report
          </h2>

          {!analyzeAsync.data && !analyzeAsync.loading && (
            <div className="flex flex-col items-center justify-center text-center h-[350px] text-gray-400 dark:text-slate-550">
              <span className="text-5xl mb-4">🎯</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-200">Your report will generate here.</p>
              <p className="text-xs mt-1 text-gray-500 dark:text-slate-400">Upload a resume, paste a job description, and click "Run AI Analysis".</p>
            </div>
          )}

          {analyzeAsync.loading && (
            <div className="flex flex-col items-center justify-center text-center h-[350px] space-y-4">
              <LoadingSpinner size="lg" message="Google Gemini AI is processing your resume..." />
              <p className="text-xs text-gray-400 dark:text-slate-550 max-w-xs leading-relaxed">We are parsing key competencies, matching attributes, and identifying skill gaps.</p>
            </div>
          )}

          {analyzeAsync.data && (
            <div className="space-y-6 animate-fadeIn">
              {/* Score Display */}
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-black ${getScoreColor(analyzeAsync.data.matchScore)}`}>
                  {analyzeAsync.data.matchScore}%
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-850 dark:text-slate-100">Match Compatibility</h3>
                  <p className="text-xs text-gray-550 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {analyzeAsync.data.matchScore >= 80 
                      ? "Excellent fit! Your resume is strongly aligned with this role."
                      : analyzeAsync.data.matchScore >= 50
                      ? "Good potential. Consider tailoring your resume with missing keywords to boost your match rate."
                      : "Weak match. Significant updates or highlighting transferrable skills might be necessary."}
                  </p>
                </div>
              </div>

              {/* Missing Keywords */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-slate-350 mb-2.5 uppercase tracking-wider">Missing Keywords / Skill Gaps</h3>
                <div className="flex flex-wrap gap-2">
                  {analyzeAsync.data.missingKeywords && analyzeAsync.data.missingKeywords.length > 0 ? (
                    analyzeAsync.data.missingKeywords.map((word, i) => (
                      <span key={i} className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 font-bold px-3 py-1.5 rounded-xl text-xs border border-amber-100 dark:border-amber-900/40">
                        {word}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-green-600 dark:text-green-400 italic">No major missing keywords found. Great job!</span>
                  )}
                </div>
              </div>

              {/* Actionable Suggestions */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-slate-350 mb-2.5 uppercase tracking-wider">Actionable Resume Enhancements</h3>
                <ul className="space-y-3">
                  {analyzeAsync.data.tailoringSuggestions && analyzeAsync.data.tailoringSuggestions.map((tip, i) => (
                    <li key={i} className="flex gap-2.5 text-xs text-gray-650 dark:text-slate-300 leading-relaxed items-start">
                      <span className="text-indigo-650 dark:text-indigo-400 mt-0.5">✔</span>
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

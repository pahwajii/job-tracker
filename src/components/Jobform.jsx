import { useState } from "react"

export default function JobForm({ addJob }) {
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState("applied")
  const [salary, setSalary] = useState("")
  const [location, setLocation] = useState("")
  const [url, setUrl] = useState("")
  const [source, setSource] = useState("")
  const [notes, setNotes] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [appliedDate, setAppliedDate] = useState(() => new Date().toISOString().split("T")[0])
  
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!company || !role) return

    const newJob = {
      company,
      role,
      status,
      salary,
      location,
      url,
      source,
      notes,
      jobDescription,
      appliedDate: new Date(appliedDate).toISOString()
    }

    addJob(newJob)
    
    // Reset form
    setCompany("")
    setRole("")
    setStatus("applied")
    setSalary("")
    setLocation("")
    setUrl("")
    setSource("")
    setNotes("")
    setJobDescription("")
    setAppliedDate(new Date().toISOString().split("T")[0])
    setShowAdvanced(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-250 rounded-2xl max-w-5xl mx-auto w-full px-6 py-6 shadow-sm mb-8 transition-all duration-300"
    >
      <div className="flex justify-between items-center mb-5 border-b pb-3">
        <h3 className="font-bold text-gray-800 text-lg">➕ Track New Application</h3>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition"
        >
          {showAdvanced ? "Hide Details ⬆" : "Show More Details ⬇"}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1 text-gray-700">Company *</label>
          <input
            type="text"
            placeholder="e.g. Google"
            className="p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1 text-gray-700">Role *</label>
          <input
            type="text"
            placeholder="e.g. Backend Engineer"
            className="p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1 text-gray-700">Status</label>
          <select
            className="p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize bg-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="saved">saved</option>
            <option value="applied">applied</option>
            <option value="screening">screening</option>
            <option value="interview">interview</option>
            <option value="offer">offer</option>
            <option value="rejected">rejected</option>
            <option value="withdrawn">withdrawn</option>
          </select>
        </div>
      </div>

      {/* Collapsible Advanced section */}
      <div className={`transition-all duration-300 overflow-hidden ${showAdvanced ? "max-h-[800px] mt-5 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
        <div className="grid gap-5 md:grid-cols-3 border-t pt-5">
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1 text-gray-700">Salary</label>
            <input
              type="text"
              placeholder="e.g. $120,000 / yr"
              className="p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1 text-gray-700">Location</label>
            <input
              type="text"
              placeholder="e.g. New York, NY (Hybrid)"
              className="p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1 text-gray-700">Application Date</label>
            <input
              type="date"
              className="p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1 text-gray-700">Job URL</label>
            <input
              type="url"
              placeholder="https://company.com/jobs/123"
              className="p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1 text-gray-700">Source</label>
            <input
              type="text"
              placeholder="e.g. LinkedIn, Referral"
              className="p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:col-span-3">
            <label className="text-xs font-semibold mb-1 text-gray-700">Notes / Reminders</label>
            <textarea
              placeholder="Resume version used, interviewer names, specific details..."
              className="p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:col-span-3">
            <label className="text-xs font-semibold mb-1 text-gray-700">Job Description (for AI Tools)</label>
            <textarea
              placeholder="Paste the full job requirements / description here..."
              className="p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition duration-200 shadow-md hover:shadow-indigo-500/20 text-sm"
        >
          ➕ Add Application
        </button>
      </div>
    </form>
  )
}

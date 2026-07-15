import { useState } from "react"
import { api } from "../services/api"

export default function JobCard({ job, onDelete, onUpdateStatus, onUpdateChecklist }) {
  const [showDetails, setShowDetails] = useState(false)
  const [newChecklistItem, setNewChecklistItem] = useState("")
  
  // AI generation states
  const [generatingPrep, setGeneratingPrep] = useState(false)
  const [generatingAssist, setGeneratingAssist] = useState(false)
  const [aiModal, setAiModal] = useState({ show: false, title: "", content: "" })
  const [copySuccess, setCopySuccess] = useState(false)

  const handleStatusChange = (e) => {
    onUpdateStatus(job._id, e.target.value)
  }

  // Checklist Handlers
  const handleAddChecklistItem = async (e) => {
    e.preventDefault()
    if (!newChecklistItem.trim()) return

    const newItem = { text: newChecklistItem.trim(), done: false }
    const updatedChecklist = [...(job.checklist || []), newItem]

    // Optimistic Update
    onUpdateChecklist(job._id, updatedChecklist)
    setNewChecklistItem("")

    try {
      await api.updateChecklist(job._id, updatedChecklist)
    } catch (err) {
      console.error("Checklist add error, rolling back:", err)
      // Rollback on failure
      onUpdateChecklist(job._id, job.checklist)
    }
  }

  const handleToggleChecklist = async (itemId) => {
    const updatedChecklist = job.checklist.map(item =>
      item._id === itemId ? { ...item, done: !item.done } : item
    )

    // Optimistic Update
    onUpdateChecklist(job._id, updatedChecklist)

    try {
      await api.updateChecklist(job._id, updatedChecklist)
    } catch (err) {
      console.error("Checklist toggle error, rolling back:", err)
      onUpdateChecklist(job._id, job.checklist)
    }
  }

  const handleDeleteChecklist = async (itemId) => {
    const updatedChecklist = job.checklist.filter(item => item._id !== itemId)

    // Optimistic Update
    onUpdateChecklist(job._id, updatedChecklist)

    try {
      await api.updateChecklist(job._id, updatedChecklist)
    } catch (err) {
      console.error("Checklist delete error, rolling back:", err)
      onUpdateChecklist(job._id, job.checklist)
    }
  }

  // AI Handler: Outreach & Interview Prep
  const handleGeneratePrep = async () => {
    setGeneratingPrep(true)
    try {
      const data = await api.generatePrep(job._id)
      setAiModal({
        show: true,
        title: `✨ Interview Prep & Outreach: ${job.company}`,
        content: data.result
      })
    } catch (err) {
      alert(err.message || "Failed to generate interview preparation material. Make sure your FORGE_API_KEY is configured.")
    } finally {
      setGeneratingPrep(false)
    }
  }

  // AI Handler: Apply Assist (Cover Letter & Why This Company)
  const handleApplyAssist = async () => {
    setGeneratingAssist(true)
    try {
      const data = await api.generateApplyAssist(job._id)
      setAiModal({
        show: true,
        title: `📝 Apply Assist: ${job.role} at ${job.company}`,
        content: data.result
      })
    } catch (err) {
      alert(err.message || "Failed to generate application assistance material. Make sure you have uploaded your resume.")
    } finally {
      setGeneratingAssist(false)
    }
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(aiModal.content)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const statusColors = {
    saved: "bg-gray-100 text-gray-700 border-gray-200",
    applied: "bg-blue-50 text-blue-700 border-blue-150",
    screening: "bg-purple-50 text-purple-700 border-purple-150",
    interview: "bg-amber-50 text-amber-700 border-amber-150",
    offer: "bg-emerald-50 text-emerald-700 border-emerald-150",
    rejected: "bg-rose-50 text-rose-700 border-rose-150",
    withdrawn: "bg-zinc-100 text-zinc-500 border-zinc-200"
  }

  // Simple Markdown to HTML Formatter (Regex-based) for modal presentation
  const renderMarkdown = (text) => {
    if (!text) return ""
    let formatted = text
      // Headers
      .replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-gray-800 mt-4 mb-2">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 class="text-md font-extrabold text-indigo-900 mt-5 mb-2 border-b pb-1">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 class="text-lg font-black text-indigo-950 mt-6 mb-3">$1</h2>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      // Lists
      .replace(/^\s*\-\s*(.*$)/gim, '<li class="ml-4 list-disc text-gray-700 mb-1">$1</li>')
      .replace(/^\s*\d\.\s*(.*$)/gim, '<li class="ml-4 list-decimal text-gray-700 mb-1">$1</li>')
      // Linebreaks
      .replace(/\n/g, "<br />")

    return <div dangerouslySetInnerHTML={{ __html: formatted }} className="text-sm leading-relaxed text-gray-700 space-y-1" />
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Primary Card View */}
      <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-gray-800">📌 {job.company}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[job.status] || statusColors.applied} capitalize`}>
              {job.status}
            </span>
          </div>
          <p className="text-gray-600 text-sm font-semibold">{job.role}</p>
          
          {/* Quick info snippet */}
          <div className="flex gap-4 text-xs text-gray-400 mt-2 flex-wrap">
            {job.location && <span>📍 {job.location}</span>}
            {job.salary && <span>💰 {job.salary}</span>}
            {job.appliedDate && (
              <span>📅 Applied: {new Date(job.appliedDate).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status selector */}
          <select
            className="border border-gray-200 p-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
            value={job.status}
            onChange={handleStatusChange}
          >
            <option value="saved">saved</option>
            <option value="applied">applied</option>
            <option value="screening">screening</option>
            <option value="interview">interview</option>
            <option value="offer">offer</option>
            <option value="rejected">rejected</option>
            <option value="withdrawn">withdrawn</option>
          </select>

          {/* Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs bg-gray-50 border border-gray-200 text-gray-600 font-bold px-3 py-2 rounded-xl hover:bg-gray-100 transition"
          >
            {showDetails ? "Hide Info" : "Details"}
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(job._id)}
            className="bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition"
          >
            ❌ Delete
          </button>
        </div>
      </div>

      {/* Expanded Details / Sub-Panels */}
      {showDetails && (
        <div className="bg-gray-50/50 border-t border-gray-100 p-5 space-y-6 animate-fadeIn">
          {/* Job Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Job Details</h3>
              <div className="space-y-2 text-sm">
                {job.url && (
                  <p>
                    <strong className="text-gray-500">Link:</strong>{" "}
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      View Job Listing ↗
                    </a>
                  </p>
                )}
                {job.source && (
                  <p>
                    <strong className="text-gray-500">Source:</strong>{" "}
                    <span className="text-gray-700">{job.source}</span>
                  </p>
                )}
                {job.notes && (
                  <div>
                    <strong className="text-gray-500 block mb-1">Notes:</strong>
                    <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-gray-600 whitespace-pre-wrap">
                      {job.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Checklist Component */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Application Tasks</h3>
              
              <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add task (e.g. Mock interview)"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  className="flex-1 p-2 rounded-lg border text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Add
                </button>
              </form>

              <div className="space-y-2 max-h-40 overflow-y-auto pt-1">
                {job.checklist && job.checklist.length > 0 ? (
                  job.checklist.map((item) => (
                    <div key={item._id || item.text} className="flex items-center justify-between bg-white p-2 rounded-lg border text-xs">
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => handleToggleChecklist(item._id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={item.done ? "line-through text-gray-400" : "text-gray-700"}>
                          {item.text}
                        </span>
                      </label>
                      <button
                        onClick={() => handleDeleteChecklist(item._id)}
                        className="text-gray-400 hover:text-red-500 transition px-1"
                      >
                        ❌
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No tasks added for this application.</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Tools Bar */}
          <div className="border-t pt-4 flex flex-wrap gap-3 items-center">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
              ✨ DeepSeek AI:
            </span>
            <button
              onClick={handleGeneratePrep}
              disabled={generatingPrep}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {generatingPrep ? (
                <>
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-indigo-700 border-t-transparent rounded-full" />
                  Generating Prep...
                </>
              ) : (
                "🎯 Prep & Outreach"
              )}
            </button>
            <button
              onClick={handleApplyAssist}
              disabled={generatingAssist}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {generatingAssist ? (
                <>
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                  Generating Cover Letter...
                </>
              ) : (
                "📝 Apply Assist"
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Result Presentation Modal */}
      {aiModal.show && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] animate-scaleUp">
            {/* Header */}
            <div className="p-5 border-b flex justify-between items-center bg-indigo-50/50 rounded-t-2xl">
              <h3 className="font-extrabold text-indigo-950 text-lg">{aiModal.title}</h3>
              <button
                onClick={() => setAiModal({ ...aiModal, show: false })}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs whitespace-pre-wrap select-all">
              {renderMarkdown(aiModal.content)}
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleCopyToClipboard}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-sm hover:shadow-indigo-500/20"
              >
                {copySuccess ? "Copied! ✓" : "Copy to Clipboard"}
              </button>
              <button
                onClick={() => setAiModal({ ...aiModal, show: false })}
                className="bg-white border border-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

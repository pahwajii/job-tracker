import { useState } from "react"

export default function JobForm({ addJob }) {
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState("Applied")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!company || !role) return

    const newJob = {
      id: Date.now(),
      company,
      role,
      status
    }

    addJob(newJob)
    setCompany("")
    setRole("")
    setStatus("Applied")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-300 rounded-2xl max-w-5xl mx-auto w-full px-6 py-8 shadow-sm"
    >
      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1 text-gray-700">Company</label>
          <input
            type="text"
            placeholder="e.g. Delta X"
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1 text-gray-700">Role</label>
          <input
            type="text"
            placeholder="e.g. Frontend Intern"
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1 text-gray-700">Status</label>
          <select
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Applied</option>
            <option>Interviewed</option>
            <option>Rejected</option>
            <option>Selected</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          ➕ Add Job
        </button>
      </div>
    </form>
  )
}

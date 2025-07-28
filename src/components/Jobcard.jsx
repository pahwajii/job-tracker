export default function JobCard({ job, onDelete, onUpdateStatus }) {
  const handleStatusChange = (e) => {
    onUpdateStatus(job.id, e.target.value)
  }

  const statusColor = {
    Applied: "bg-yellow-100 text-yellow-800",
    Interviewed: "bg-blue-100 text-blue-800",
    Rejected: "bg-red-100 text-red-800",
    Selected: "bg-green-100 text-green-800"
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          📌 {job.company}
        </h2>
        <p className="text-gray-600 text-sm">{job.role}</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[job.status]}`}>
          {job.status}
        </span>

        <select
          className="border p-2 rounded-md text-sm focus:outline-none"
          value={job.status}
          onChange={handleStatusChange}
        >
          <option value="Applied">Applied</option>
          <option value="Interviewed">Interviewed</option>
          <option value="Rejected">Rejected</option>
          <option value="Selected">Selected</option>
        </select>

        <button
          onClick={() => onDelete(job.id)}
          className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm hover:bg-red-200"
        >
          ❌ Delete
        </button>
      </div>
    </div>
  )
}

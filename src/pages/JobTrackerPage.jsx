import { useState, useEffect } from "react"
import JobForm from "../components/Jobform"
import FilterBar from "../components/Filterbar"
import JobCard from "../components/Jobcard"
import StatBar from "../components/StatBar"
import { api } from "../services/api"

export default function JobTrackerPage() {
  const [jobs, setJobs] = useState([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api.getJobs()
        setJobs(data)
      } catch (err) {
        console.error(err)
        setError("Failed to fetch jobs. Please verify the backend is running.")
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const addJob = async (jobData) => {
    try {
      const createdJob = await api.createJob(jobData)
      setJobs([createdJob, ...jobs])
    } catch (err) {
      console.error(err)
      alert(err.message || "Failed to create job.")
    }
  }

  const deleteJob = async (id) => {
    try {
      await api.deleteJob(id)
      setJobs(jobs.filter(j => j._id !== id))
    } catch (err) {
      console.error(err)
      alert(err.message || "Failed to delete job.")
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      const updatedJob = await api.updateJob(id, { status: newStatus })
      setJobs(jobs.map(j => j._id === id ? updatedJob : j))
    } catch (err) {
      console.error(err)
      alert(err.message || "Failed to update status.")
    }
  }

  const updateChecklist = (id, newChecklist) => {
    setJobs(jobs.map(j => j._id === id ? { ...j, checklist: newChecklist } : j))
  }

  const filteredJobs = filter === "all" ? jobs : jobs.filter(j => j.status === filter)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <span className="animate-spin inline-block w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
        <p className="text-sm font-semibold text-gray-500">Loading your tracker dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-900 mb-2 drop-shadow-sm">
          📋 Career Tracker
        </h1>
        <p className="text-sm text-gray-500">Organize applications, manage interviews, and track offers</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <StatBar jobs={jobs} />
      <JobForm addJob={addJob} />
      <FilterBar filter={filter} setFilter={setFilter} />

      <div className="space-y-4 mt-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <JobCard
              key={job._id}
              job={job}
              onDelete={deleteJob}
              onUpdateStatus={updateStatus}
              onUpdateChecklist={updateChecklist}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <span className="text-4xl">📭</span>
            <p className="text-gray-500 font-semibold text-sm mt-3">No jobs found in this filter.</p>
            <p className="text-xs text-gray-400 mt-1">Get started by creating a new job application above.</p>
          </div>
        )}
      </div>
    </div>
  )
}

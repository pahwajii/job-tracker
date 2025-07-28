import { useState, useEffect } from "react"
import JobForm from "../components/Jobform"
import Filterbar from "../components/Filterbar"
import JobCard from "../components/Jobcard"
import StatBar from "../components/StatBar"

export default function JobTrackerPage() {
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem("jobList")
    return saved ? JSON.parse(saved) : []
  })

  const [filter, setFilter] = useState("All")

  useEffect(() => {
    localStorage.setItem("jobList", JSON.stringify(jobs))
  }, [jobs])

  const addJob = (job) => setJobs([...jobs, job])
  const deleteJob = (id) => setJobs(jobs.filter(j => j.id !== id))
  const updateStatus = (id, newStatus) =>
    setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus } : j))

  const filteredJobs = filter === "All" ? jobs : jobs.filter(j => j.status === filter)

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-10 drop-shadow">
        📋 Job Tracker
      </h1>
      <StatBar jobs={jobs} />
      <JobForm addJob={addJob} />
      <Filterbar filter={filter} setFilter={setFilter} />

      <div className="space-y-4 mt-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onDelete={deleteJob}
              onUpdateStatus={updateStatus}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 text-lg mt-10">No jobs added yet.</p>
        )}
      </div>
    </div>
  )
}

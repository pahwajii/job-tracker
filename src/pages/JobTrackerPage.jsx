import { useState, useEffect } from "react"
import JobForm from "../components/Jobform"
import FilterBar from "../components/Filterbar"
import JobCard from "../components/Jobcard"
import StatBar from "../components/StatBar"
import useJobs from "../hooks/useJobs"
import EmptyState from "../components/ui/EmptyState"
import Skeleton from "../components/ui/Skeleton"
import Card from "../components/ui/Card"

export default function JobTrackerPage() {
  const {
    jobs,
    loading,
    error,
    fetchJobs,
    addJob,
    updateJobStatus,
    updateJobChecklist,
    removeJob
  } = useJobs()

  const [filter, setFilter] = useState("all")

  // Load jobs on page mount
  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const filteredJobs = filter === "all" ? jobs : jobs.filter(j => j.status === filter)

  if (loading && jobs.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 pb-12 space-y-6">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        
        {/* Statbar Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 flex flex-col items-center">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-6 w-10" />
            </Card>
          ))}
        </div>

        {/* Form Skeleton */}
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b dark:border-slate-800">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </Card>

        {/* Job Card Skeletons */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-5 flex justify-between items-center">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-3.5 w-1/4" />
              </div>
              <Skeleton className="h-8 w-20" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12 transition-colors duration-300">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-950 dark:text-white mb-2 drop-shadow-xs tracking-tight">
          📋 Career Tracker
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Organize applications, manage interviews, and track offers</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded-r-xl mb-6 text-sm">
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
              onDelete={removeJob}
              onUpdateStatus={updateJobStatus}
              onUpdateChecklist={updateJobChecklist}
            />
          ))
        ) : (
          <EmptyState
            icon="📭"
            title="No applications found"
            description={
              filter === "all"
                ? "Get started by adding your first job application above."
                : `You don't have any job applications with status "${filter}" yet.`
            }
          />
        )}
      </div>
    </div>
  )
}

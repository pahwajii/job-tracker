export default function StatBar({ jobs }) {
  const total = jobs.length
  const selected = jobs.filter(j => j.status === "Selected").length
  const rejected = jobs.filter(j => j.status === "Rejected").length
  const applied = jobs.filter(j => j.status === "Applied").length
  const interviewed = jobs.filter(j => j.status === "Interviewed").length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
      <StatCard label="Total" count={total} color="bg-gray-100 text-gray-700" />
      <StatCard label="Selected" count={selected} color="bg-green-100 text-green-700" />
      <StatCard label="Rejected" count={rejected} color="bg-red-100 text-red-700" />
      <StatCard label="Applied" count={applied} color="bg-yellow-100 text-yellow-700" />
      <StatCard label="Interviewed" count={interviewed} color="bg-blue-100 text-blue-700" />
    </div>
  )
}

function StatCard({ label, count, color }) {
  return (
    <div className={`p-4 rounded-xl text-center shadow-sm ${color}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xl font-bold">{count}</p>
    </div>
  )
}

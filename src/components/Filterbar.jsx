export default function FilterBar({ filter, setFilter }) {
  const statuses = ["all", "saved", "applied", "screening", "interview", "offer", "rejected", "withdrawn"]

  return (
    <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-150">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">🎯 Filter Applications</span>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="border border-gray-200 p-2.5 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 bg-white capitalize"
      >
        {statuses.map(status => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  )
}

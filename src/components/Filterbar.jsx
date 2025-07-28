export default function FilterBar({ filter, setFilter }) {
  return (
    <div className="mt-4 flex justify-end">
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="border p-2 rounded shadow"
      >
        <option value="All">All</option>
        <option value="Applied">Applied</option>
        <option value="Interviewed">Interviewed</option>
        <option value="Rejected">Rejected</option>
        <option value="Selected">Selected</option>
      </select>
    </div>
  )
}

import { Link, useLocation } from "react-router-dom"

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="bg-white shadow-sm px-6 py-4 mb-6 flex justify-between items-center">
      <h2 className="text-xl font-bold text-blue-700">📘 Career Manager</h2>
      <div className="flex gap-4">
        <Link to="/" className={`${pathname === "/" ? "text-blue-600 font-semibold" : "text-gray-700"} hover:underline`}>
          🗂 Job Tracker
        </Link>
        <Link to="/profiles" className={`${pathname === "/profiles" ? "text-blue-600 font-semibold" : "text-gray-700"} hover:underline`}>
          🔗 Your Profiles
        </Link>
      </div>
    </nav>
  )
}

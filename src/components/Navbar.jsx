import { Link, useLocation, useNavigate } from "react-router-dom"

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
    window.location.reload()
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 mb-8 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📘</span>
        <h2 className="text-xl font-black text-indigo-900 tracking-tight">Career Manager</h2>
      </div>
      
      <div className="flex items-center gap-6">
        {token ? (
          <>
            <div className="hidden md:flex gap-6">
              <Link to="/" className={`${pathname === "/" ? "text-indigo-600 font-bold" : "text-gray-600"} hover:text-indigo-800 transition text-sm`}>
                🗂 Job Tracker
              </Link>
              <Link to="/profiles" className={`${pathname === "/profiles" ? "text-indigo-600 font-bold" : "text-gray-600"} hover:text-indigo-800 transition text-sm`}>
                🔗 Professional Links
              </Link>
              <Link to="/resume-analyzer" className={`${pathname === "/resume-analyzer" ? "text-indigo-600 font-bold" : "text-gray-600"} hover:text-indigo-800 transition text-sm`}>
                🔍 Resume Analyzer
              </Link>
            </div>
            
            <div className="flex items-center gap-4 border-l pl-6 border-gray-150">
              <span className="text-sm font-semibold text-gray-700 hidden sm:inline">Hi, {user?.name || "User"}</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                🚪 Log Out
              </button>
            </div>
          </>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="bg-transparent hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs transition border">
              Sign In
            </Link>
            <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import JobTrackerPage from "./pages/JobTrackerPage"
import ProfilePage from "./pages/ProfilePage"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ResumeAnalyzerPage from "./pages/ResumeAnalyzerPage"
import InterviewPrepPage from "./pages/InterviewPrepPage"

// Simple Auth Guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token")
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <div className="bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300 ease-in-out">
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <JobTrackerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profiles"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-analyzer"
            element={
              <ProtectedRoute>
                <ResumeAnalyzerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prep"
            element={
              <ProtectedRoute>
                <InterviewPrepPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App

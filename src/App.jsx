import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import JobTrackerPage from "./pages/JobTrackerPage"
import ProfileLinksPage from "./pages/ProfileLinksPage"

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<JobTrackerPage />} />
        <Route path="/profiles" element={<ProfileLinksPage />} />
      </Routes>
    </Router>
  )
}

export default App

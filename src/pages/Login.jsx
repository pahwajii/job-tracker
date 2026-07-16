import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../services/api"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const data = await api.login(email, password)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      
      navigate("/")
      window.location.reload()
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-300">
      {/* Background blobs for premium glassmorphism feel */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-2xl opacity-20 dark:opacity-10 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-2xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-gray-200/50 dark:border-slate-800/80 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-950 dark:text-white tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">Sign in to manage your career journey</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-3 rounded-r-lg mb-6 text-sm flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />

          <Input
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 mt-2 shadow-lg"
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-slate-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600 dark:text-indigo-455 font-bold hover:underline">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  )
}

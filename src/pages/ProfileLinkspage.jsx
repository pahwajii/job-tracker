import { useEffect, useState } from "react"
import { api } from "../services/api"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"

export default function ProfileLinksPage() {
  const [links, setLinks] = useState({
    linkedin: "",
    github: "",
    leetcode: "",
    portfolio: ""
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  // 🔁 Load from localStorage user profileLinks on first render
  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.profileLinks) {
        setLinks({
          linkedin: user.profileLinks.linkedin || "",
          github: user.profileLinks.github || "",
          leetcode: user.profileLinks.leetcode || "",
          portfolio: user.profileLinks.portfolio || ""
        })
      }
    }
  }, [])

  const handleChange = (e) => {
    setLinks({ ...links, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: "", type: "" })

    try {
      const response = await api.updateProfileLinks(links)
      
      // Update local storage user object
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        user.profileLinks = response.profileLinks
        localStorage.setItem("user", JSON.stringify(user))
      }

      setMessage({ text: "Profile links saved successfully!", type: "success" })
    } catch (error) {
      console.error(error)
      setMessage({ text: error.message || "Failed to update profile links.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto p-8 mt-8 border border-gray-200 dark:border-slate-800 transition-colors duration-300">
      <h1 className="text-3xl font-extrabold text-indigo-950 dark:text-white mb-2 tracking-tight">🔗 Professional Links</h1>
      <p className="text-gray-500 dark:text-slate-400 mb-6 text-sm">Save your profiles to customize resume analysis and job matching metrics</p>
      
      {message.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-semibold border-l-4 ${message.type === "success" ? "bg-green-50 text-green-800 border-green-500 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-800 border-red-500 dark:bg-red-950/20 dark:text-red-400"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {["linkedin", "github", "leetcode", "portfolio"].map((key) => (
          <Input
            key={key}
            label={key}
            id={key}
            name={key}
            type="url"
            placeholder={`https://${key}.com/yourusername`}
            value={links[key]}
            onChange={handleChange}
          />
        ))}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            Save Profiles
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-850 space-y-3">
        <h2 className="text-lg font-bold text-indigo-950 dark:text-white tracking-tight">🌐 Profile Preview:</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(links).map(([key, value]) => (
            value && (
              <a
                key={key}
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-indigo-400 font-bold px-4 py-2 rounded-xl text-xs transition duration-150 border dark:border-slate-700"
              >
                <span>{key === "linkedin" ? "💼" : key === "github" ? "💻" : key === "leetcode" ? "🧠" : "🌐"}</span>
                <span className="capitalize">{key}</span>
              </a>
            )
          ))}
          {!Object.values(links).some(Boolean) && (
            <p className="text-sm text-gray-400 dark:text-slate-500 italic">No profiles added yet.</p>
          )}
        </div>
      </div>
    </Card>
  )
}

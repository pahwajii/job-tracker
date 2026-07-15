import { useEffect, useState } from "react"
import { api } from "../services/api"

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
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-8">
      <h1 className="text-3xl font-extrabold text-indigo-900 mb-2">🔗 Professional Links</h1>
      <p className="text-gray-500 mb-6 text-sm">Save your profiles to customize resume analysis and job matching metrics</p>
      
      {message.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm ${message.type === "success" ? "bg-green-50 text-green-800 border-l-4 border-green-500" : "bg-red-50 text-red-800 border-l-4 border-red-500"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {["linkedin", "github", "leetcode", "portfolio"].map((key) => (
          <div key={key}>
            <label className="block mb-1.5 capitalize text-sm font-semibold text-gray-700">{key}</label>
            <input
              type="url"
              name={key}
              placeholder={`https://${key}.com/yourusername`}
              value={links[key]}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition text-sm text-gray-800"
            />
          </div>
        ))}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition duration-200 shadow-md hover:shadow-indigo-500/20 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Profiles"}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
        <h2 className="text-lg font-bold text-indigo-950">🌐 Profile Preview:</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(links).map(([key, value]) => (
            value && (
              <a
                key={key}
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-indigo-100 transition duration-150"
              >
                <span>{key === "linkedin" ? "💼" : key === "github" ? "💻" : key === "leetcode" ? "🧠" : "🌐"}</span>
                <span className="capitalize">{key}</span>
              </a>
            )
          ))}
          {!Object.values(links).some(Boolean) && (
            <p className="text-sm text-gray-400 italic">No profiles added yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

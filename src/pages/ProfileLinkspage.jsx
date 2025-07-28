import { useEffect, useState } from "react"

export default function ProfileLinksPage() {
  const [links, setLinks] = useState({
    linkedin: "",
    github: "",
    leetcode: "",
    portfolio: ""
  })

  // 🔁 Load from localStorage on first render
  useEffect(() => {
    const storedLinks = localStorage.getItem("studentProfiles")
    if (storedLinks) {
      setLinks(JSON.parse(storedLinks))
    }
  }, [])

  // 💾 Save to localStorage whenever links change
  useEffect(() => {
    localStorage.setItem("studentProfiles", JSON.stringify(links))
  }, [links])

  const handleChange = (e) => {
    setLinks({ ...links, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">🔗 Your Profiles</h1>
      <div className="space-y-4">
        {["linkedin", "github", "leetcode", "portfolio"].map((key) => (
          <div key={key}>
            <label className="block mb-1 capitalize text-sm font-medium text-gray-700">{key}:</label>
            <input
              type="url"
              name={key}
              placeholder={`https://${key}.com/yourusername`}
              value={links[key]}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-2">
        <h2 className="text-lg font-semibold text-gray-800">🌐 Preview:</h2>
        <ul className="list-disc pl-5 text-blue-600">
          {Object.entries(links).map(([key, value]) => (
            value && (
              <li key={key}>
                <a href={value} target="_blank" rel="noopener noreferrer" className="underline">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </a>
              </li>
            )
          ))}
        </ul>
      </div>
    </div>
  )
}

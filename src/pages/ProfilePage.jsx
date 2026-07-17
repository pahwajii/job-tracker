import { useEffect, useState } from "react"
import { api } from "../services/api"
import useAsync from "../hooks/useAsync"
import useAuth from "../hooks/useAuth"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import FileUpload from "../components/ui/FileUpload"
import LoadingSpinner from "../components/ui/LoadingSpinner"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal")
  const { updateUserCache } = useAuth()
  
  // Async executors
  const getProfileAsync = useAsync(api.getProfile)
  const updateProfileAsync = useAsync(api.updateProfile)
  const uploadResumeAsync = useAsync(api.uploadResumeFile)
  const uploadPortfolioAsync = useAsync(api.uploadPortfolioFile)

  const [message, setMessage] = useState({ text: "", type: "" })

  // Full Profile Form State
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    headline: "",
    bio: "",
    profileLinks: { linkedin: "", github: "", leetcode: "", portfolio: "" },
    codingProfiles: { leetcode: "", codechef: "", github: "", linkedin: "", portfolio: "" },
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    skills: [],
    careerPreferences: { targetRoles: [], preferredLocations: [], jobTypes: [] },
    resumeFileName: "",
    portfolioFileName: ""
  })

  // Local helper states for adding items to arrays
  const [newSkill, setNewSkill] = useState("")
  const [newRolePref, setNewRolePref] = useState("")
  const [newLocPref, setNewLocPref] = useState("")

  // Fetch complete profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfileAsync.execute()
        setProfile({
          name: data.name || "",
          phone: data.phone || "",
          headline: data.headline || "",
          bio: data.bio || "",
          profileLinks: data.profileLinks || { linkedin: "", github: "", leetcode: "", portfolio: "" },
          codingProfiles: data.codingProfiles || { leetcode: "", codechef: "", github: "", linkedin: "", portfolio: "" },
          education: data.education || [],
          experience: data.experience || [],
          projects: data.projects || [],
          certifications: data.certifications || [],
          skills: data.skills || [],
          careerPreferences: data.careerPreferences || { targetRoles: [], preferredLocations: [], jobTypes: [] },
          resumeFileName: data.resumeFileName || "",
          portfolioFileName: data.portfolioFileName || ""
        })
      } catch (err) {
        console.error(err)
      }
    }
    loadProfile()
  }, [])

  const showToast = (text, type = "success") => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: "", type: "" }), 5000)
  }

  // General change handler for nested profile links
  const handleNestedChange = (section, key, value) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  // Handle Save Profile updates
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault()
    setMessage({ text: "", type: "" })
    
    try {
      const data = await updateProfileAsync.execute(profile)
      // Sync auth user details context cache
      updateUserCache({
        name: data.name,
        profileLinks: data.profileLinks,
        resumeText: data.resumeText
      })
      showToast("Career profile updated successfully!", "success")
    } catch (err) {
      showToast(err.message || "Failed to update profile.", "error")
    }
  }

  // Skills handlers
  const handleAddSkill = (e) => {
    e.preventDefault()
    if (!newSkill.trim() || profile.skills.includes(newSkill.trim())) return
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }))
    setNewSkill("")
  }

  const handleRemoveSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }))
  }

  // Career Preferences handlers
  const handleAddRolePref = (e) => {
    e.preventDefault()
    const val = newRolePref.trim()
    if (!val || profile.careerPreferences.targetRoles.includes(val)) return
    setProfile(prev => ({
      ...prev,
      careerPreferences: {
        ...prev.careerPreferences,
        targetRoles: [...prev.careerPreferences.targetRoles, val]
      }
    }))
    setNewRolePref("")
  }

  const handleRemoveRolePref = (role) => {
    setProfile(prev => ({
      ...prev,
      careerPreferences: {
        ...prev.careerPreferences,
        targetRoles: prev.careerPreferences.targetRoles.filter(r => r !== role)
      }
    }))
  }

  const handleAddLocPref = (e) => {
    e.preventDefault()
    const val = newLocPref.trim()
    if (!val || profile.careerPreferences.preferredLocations.includes(val)) return
    setProfile(prev => ({
      ...prev,
      careerPreferences: {
        ...prev.careerPreferences,
        preferredLocations: [...prev.careerPreferences.preferredLocations, val]
      }
    }))
    setNewLocPref("")
  }

  const handleRemoveLocPref = (loc) => {
    setProfile(prev => ({
      ...prev,
      careerPreferences: {
        ...prev.careerPreferences,
        preferredLocations: prev.careerPreferences.preferredLocations.filter(l => l !== loc)
      }
    }))
  }

  const handleJobTypeToggle = (type) => {
    const currentTypes = profile.careerPreferences.jobTypes || []
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]

    setProfile(prev => ({
      ...prev,
      careerPreferences: {
        ...prev.careerPreferences,
        jobTypes: updatedTypes
      }
    }))
  }

  // Document uploaders
  const handleUploadResume = async (file) => {
    if (!file) return
    const formData = new FormData()
    formData.append("resume", file)

    try {
      const data = await uploadResumeAsync.execute(formData)
      setProfile(prev => ({ ...prev, resumeFileName: data.resumeFileName }))
      showToast("Resume uploaded successfully!", "success")
    } catch (err) {
      showToast(err.message || "Failed to upload resume.", "error")
    }
  }

  const handleUploadPortfolio = async (file) => {
    if (!file) return
    const formData = new FormData()
    formData.append("portfolio", file)

    try {
      const data = await uploadPortfolioAsync.execute(formData)
      setProfile(prev => ({ ...prev, portfolioFileName: data.portfolioFileName }))
      showToast("Portfolio document uploaded successfully!", "success")
    } catch (err) {
      showToast(err.message || "Failed to upload portfolio.", "error")
    }
  }

  const tabs = [
    { id: "personal", label: "👤 Personal Details" },
    { id: "links", label: "🔗 Coding Links" },
    { id: "experience", label: "💼 Experience" },
    { id: "education", label: "🎓 Education" },
    { id: "projects", label: "🚀 Projects" },
    { id: "certifications", label: "🏆 Certifications" },
    { id: "skills", label: "🛠 Skills & Roles" },
    { id: "documents", label: "📁 Documents" }
  ]

  if (getProfileAsync.loading) {
    return <LoadingSpinner size="lg" message="Loading Master Career Profile..." className="min-h-[50vh]" />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16 transition-colors duration-300">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-indigo-950 dark:text-white tracking-tight">👤 Master Career Profile</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure your personal credentials, project histories, skills, and target job preferences.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-semibold border-l-4 ${message.type === "success" ? "bg-green-50 text-green-800 border-green-500 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-800 border-red-500 dark:bg-red-950/20 dark:text-red-400"}`}>
          {message.text}
        </div>
      )}

      {/* Main Tabbed Grid */}
      <div className="grid md:grid-cols-4 gap-8 items-start">
        {/* Left Tabs Bar */}
        <div className="flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setMessage({ text: "", type: "" })
              }}
              className={`text-left text-sm font-bold px-4 py-3 rounded-xl transition duration-150 active:scale-[0.99] ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white hover:bg-gray-50 text-gray-650 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-350 border dark:border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Active Tab Content */}
        <div className="md:col-span-3">
          <Card className="p-6">
            {/* PERSONAL DETAILS */}
            {activeTab === "personal" && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 border-b dark:border-slate-850 pb-2">👤 Personal Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Phone Number"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="e.g. +1 555-0199"
                  />
                </div>
                <Input
                  label="Professional Headline"
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  placeholder="e.g. Senior Frontend Developer | React Specialist"
                />
                <Input
                  label="Short Biography / Summary"
                  as="textarea"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about your background, achievements, and career interests..."
                  className="h-28"
                />
                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" loading={updateProfileAsync.loading}>
                    Save Details
                  </Button>
                </div>
              </form>
            )}

            {/* CODING LINKS */}
            {activeTab === "links" && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 border-b dark:border-slate-850 pb-2">🔗 Coding Profiles & Socials</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="GitHub Profile"
                    value={profile.codingProfiles.github}
                    onChange={(e) => handleNestedChange("codingProfiles", "github", e.target.value)}
                    placeholder="https://github.com/username"
                  />
                  <Input
                    label="LinkedIn Profile"
                    value={profile.codingProfiles.linkedin}
                    onChange={(e) => handleNestedChange("codingProfiles", "linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                  <Input
                    label="LeetCode Profile"
                    value={profile.codingProfiles.leetcode}
                    onChange={(e) => handleNestedChange("codingProfiles", "leetcode", e.target.value)}
                    placeholder="https://leetcode.com/username"
                  />
                  <Input
                    label="CodeChef Profile"
                    value={profile.codingProfiles.codechef}
                    onChange={(e) => handleNestedChange("codingProfiles", "codechef", e.target.value)}
                    placeholder="https://codechef.com/users/username"
                  />
                </div>
                <Input
                  label="Portfolio Link"
                  value={profile.codingProfiles.portfolio}
                  onChange={(e) => handleNestedChange("codingProfiles", "portfolio", e.target.value)}
                  placeholder="https://yourwebsite.dev"
                />
                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" loading={updateProfileAsync.loading}>
                    Save Links
                  </Button>
                </div>
              </form>
            )}

            {/* WORK EXPERIENCE */}
            {activeTab === "experience" && (
              <ArraySection
                title="💼 Employment Experience"
                items={profile.experience}
                onSave={(items) => {
                  setProfile(prev => ({ ...prev, experience: items }))
                  setMessage({ text: "Work history updated locally. Save profile to update database.", type: "success" })
                }}
                renderItem={(item) => (
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{item.role} @ {item.company}</h4>
                    <p className="text-xs text-gray-550 dark:text-slate-400 font-semibold">{item.startDate} — {item.current ? "Present" : item.endDate} | {item.location}</p>
                    {item.description && <p className="text-xs mt-1 bg-gray-50 dark:bg-slate-950/20 p-2 rounded-lg border dark:border-slate-850 whitespace-pre-wrap leading-relaxed">{item.description}</p>}
                  </div>
                )}
                formFields={[
                  { key: "company", label: "Company Name *", required: true },
                  { key: "role", label: "Job Role / Title *", required: true },
                  { key: "location", label: "Location", placeholder: "e.g. San Francisco (Remote)" },
                  { key: "startDate", label: "Start Date *", type: "month", required: true },
                  { key: "endDate", label: "End Date (if not current)", type: "month" },
                  { key: "current", label: "I currently work here", type: "checkbox" },
                  { key: "description", label: "Responsibilities & Achievements", as: "textarea", className: "h-24" }
                ]}
                defaultItem={{ company: "", role: "", location: "", startDate: "", endDate: "", current: false, description: "" }}
                submitTrigger={handleSaveProfile}
                isUpdating={updateProfileAsync.loading}
              />
            )}

            {/* EDUCATION */}
            {activeTab === "education" && (
              <ArraySection
                title="🎓 Academic Credentials"
                items={profile.education}
                onSave={(items) => {
                  setProfile(prev => ({ ...prev, education: items }))
                  setMessage({ text: "Education history updated locally. Save profile to update database.", type: "success" })
                }}
                renderItem={(item) => (
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{item.degree} in {item.fieldOfStudy}</h4>
                    <p className="text-xs text-gray-550 dark:text-slate-400 font-semibold">{item.school}</p>
                    <p className="text-xs mt-0.5 text-slate-500">{item.startDate} — {item.endDate} {item.grade && `| Grade: ${item.grade}`}</p>
                  </div>
                )}
                formFields={[
                  { key: "school", label: "School / University Name *", required: true },
                  { key: "degree", label: "Degree Title *", placeholder: "e.g. B.S. or Diploma", required: true },
                  { key: "fieldOfStudy", label: "Field of Study *", placeholder: "e.g. Computer Science", required: true },
                  { key: "startDate", label: "Start Date *", type: "month", required: true },
                  { key: "endDate", label: "End Date *", type: "month", required: true },
                  { key: "grade", label: "Grade / GPA" }
                ]}
                defaultItem={{ school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", grade: "" }}
                submitTrigger={handleSaveProfile}
                isUpdating={updateProfileAsync.loading}
              />
            )}

            {/* PROJECTS */}
            {activeTab === "projects" && (
              <ArraySection
                title="🚀 Side Projects"
                items={profile.projects}
                onSave={(items) => {
                  setProfile(prev => ({ ...prev, projects: items }))
                  setMessage({ text: "Projects updated locally. Save profile to update database.", type: "success" })
                }}
                renderItem={(item) => (
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                      <span>{item.title}</span>
                      {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Link ↗</a>}
                    </h4>
                    {item.description && <p className="text-xs text-gray-550 dark:text-slate-350 leading-relaxed">{item.description}</p>}
                    {item.technologies && item.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.technologies.map((t, idx) => (
                          <span key={idx} className="bg-indigo-50 text-indigo-600 dark:bg-slate-850 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                formFields={[
                  { key: "title", label: "Project Title *", required: true },
                  { key: "description", label: "Project Description", as: "textarea", className: "h-20" },
                  { key: "technologiesRaw", label: "Technologies (Comma separated)", placeholder: "e.g. React, Express, MongoDB" },
                  { key: "link", label: "Project URL Link", placeholder: "https://github.com/..." }
                ]}
                beforeSave={(item) => {
                  const tech = item.technologiesRaw 
                    ? item.technologiesRaw.split(",").map(t => t.trim()).filter(Boolean) 
                    : []
                  return { ...item, technologies: tech }
                }}
                defaultItem={{ title: "", description: "", technologiesRaw: "", link: "" }}
                submitTrigger={handleSaveProfile}
                isUpdating={updateProfileAsync.loading}
              />
            )}

            {/* CERTIFICATIONS */}
            {activeTab === "certifications" && (
              <ArraySection
                title="🏆 Credentials & Certifications"
                items={profile.certifications}
                onSave={(items) => {
                  setProfile(prev => ({ ...prev, certifications: items }))
                  setMessage({ text: "Certifications updated locally. Save profile to update database.", type: "success" })
                }}
                renderItem={(item) => (
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{item.name}</h4>
                    <p className="text-xs text-gray-550 dark:text-slate-400 font-semibold">{item.issuingOrganization}</p>
                    <p className="text-[11px] mt-0.5 text-slate-500">Issued: {item.issueDate} {item.expirationDate && `| Expires: ${item.expirationDate}`}</p>
                    {item.credentialId && <p className="text-[11px] font-mono text-gray-450 dark:text-slate-500">ID: {item.credentialId}</p>}
                    {item.credentialUrl && <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-650 dark:text-indigo-400 hover:underline">Verify Credential ↗</a>}
                  </div>
                )}
                formFields={[
                  { key: "name", label: "Certification Name *", required: true },
                  { key: "issuingOrganization", label: "Issuing Organization *", required: true },
                  { key: "issueDate", label: "Issue Date *", type: "month", required: true },
                  { key: "expirationDate", label: "Expiration Date", type: "month" },
                  { key: "credentialId", label: "Credential ID" },
                  { key: "credentialUrl", label: "Credential URL Verification" }
                ]}
                defaultItem={{ name: "", issuingOrganization: "", issueDate: "", expirationDate: "", credentialId: "", credentialUrl: "" }}
                submitTrigger={handleSaveProfile}
                isUpdating={updateProfileAsync.loading}
              />
            )}

            {/* SKILLS & ROLES PREFERENCES */}
            {activeTab === "skills" && (
              <div className="space-y-6">
                {/* Skills tags */}
                <div className="space-y-3">
                  <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 border-b dark:border-slate-850 pb-2">🛠 Core Skills List</h3>
                  <form onSubmit={handleAddSkill} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Add skill (e.g. React, Node.js, GraphQL)"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                      />
                    </div>
                    <Button type="submit" variant="primary">Add</Button>
                  </form>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profile.skills.map(skill => (
                      <span key={skill} className="bg-indigo-50 border border-indigo-100/50 text-indigo-750 dark:bg-slate-850 dark:text-indigo-400 dark:border-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5">
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                      </span>
                    ))}
                    {profile.skills.length === 0 && <p className="text-xs text-gray-450 dark:text-slate-500 italic">No skills added yet.</p>}
                  </div>
                </div>

                {/* Target roles and locations */}
                <div className="space-y-5 pt-4 border-t dark:border-slate-850">
                  <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 border-b dark:border-slate-850 pb-2">🎯 Target Preferences</h3>
                  
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Roles preferences */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Target Job Roles</h4>
                      <form onSubmit={handleAddRolePref} className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder="Add role (e.g. Solutions Architect)"
                            value={newRolePref}
                            onChange={(e) => setNewRolePref(e.target.value)}
                          />
                        </div>
                        <Button type="submit" variant="primary">Add</Button>
                      </form>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {profile.careerPreferences.targetRoles.map(role => (
                          <span key={role} className="bg-indigo-50 border dark:border-slate-700 text-indigo-750 dark:bg-slate-850 dark:text-indigo-400 font-semibold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                            {role}
                            <button type="button" onClick={() => handleRemoveRolePref(role)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Location preferences */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Preferred Locations</h4>
                      <form onSubmit={handleAddLocPref} className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder="Add location (e.g. Remote, Chicago)"
                            value={newLocPref}
                            onChange={(e) => setNewLocPref(e.target.value)}
                          />
                        </div>
                        <Button type="submit" variant="primary">Add</Button>
                      </form>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {profile.careerPreferences.preferredLocations.map(loc => (
                          <span key={loc} className="bg-indigo-50 border dark:border-slate-700 text-indigo-750 dark:bg-slate-850 dark:text-indigo-400 font-semibold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                            {loc}
                            <button type="button" onClick={() => handleRemoveLocPref(loc)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Job types checkmarks */}
                  <div className="space-y-3 pt-3">
                    <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Preferred Job Types</h4>
                    <div className="flex flex-wrap gap-4 pt-1">
                      {["Full-time", "Part-time", "Contract", "Internship", "Remote", "Hybrid"].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-slate-350 select-none">
                          <input
                            type="checkbox"
                            checked={profile.careerPreferences.jobTypes.includes(type)}
                            onChange={() => handleJobTypeToggle(type)}
                            className="rounded border-gray-300 dark:border-slate-700 text-indigo-650 focus:ring-indigo-500 bg-white dark:bg-slate-900 w-4 h-4"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t dark:border-slate-850">
                  <Button onClick={handleSaveProfile} variant="primary" loading={updateProfileAsync.loading}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}

            {/* DOCUMENTS RESUME / PORTFOLIO */}
            {activeTab === "documents" && (
              <div className="space-y-8">
                {/* Resume section */}
                <div className="space-y-3">
                  <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 border-b dark:border-slate-850 pb-2">📄 Resume Document (PDF)</h3>
                  {profile.resumeFileName ? (
                    <div className="flex items-center justify-between bg-indigo-50/50 dark:bg-slate-950/20 border border-indigo-100 dark:border-indigo-900/40 p-4 rounded-xl">
                      <div className="text-xs">
                        <p className="font-bold text-indigo-950 dark:text-indigo-400">✅ Currently Uploaded:</p>
                        <p className="font-mono text-gray-500 dark:text-slate-400 mt-0.5">{profile.resumeFileName}</p>
                      </div>
                      <a href={`http://localhost:5000/uploads/resumes/${profile.resumeFileName}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline">
                        View File
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-450 dark:text-slate-500 italic">No resume PDF uploaded yet.</p>
                  )}
                  <FileUpload
                    onFileSelect={handleUploadResume}
                    uploading={uploadResumeAsync.loading}
                    accept=".pdf"
                    helperText="Upload your custom resume PDF"
                  />
                </div>

                {/* Portfolio section */}
                <div className="space-y-3 pt-4 border-t dark:border-slate-850">
                  <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 border-b dark:border-slate-850 pb-2">📁 Portfolio Document (PDF/Images)</h3>
                  {profile.portfolioFileName ? (
                    <div className="flex items-center justify-between bg-indigo-50/50 dark:bg-slate-950/20 border border-indigo-100 dark:border-indigo-900/40 p-4 rounded-xl">
                      <div className="text-xs">
                        <p className="font-bold text-indigo-950 dark:text-indigo-400">✅ Currently Uploaded:</p>
                        <p className="font-mono text-gray-500 dark:text-slate-400 mt-0.5">{profile.portfolioFileName}</p>
                      </div>
                      <a href={`http://localhost:5000/uploads/portfolios/${profile.portfolioFileName}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline">
                        View File
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-450 dark:text-slate-500 italic">No portfolio PDF/image uploaded yet.</p>
                  )}
                  <FileUpload
                    onFileSelect={handleUploadPortfolio}
                    uploading={uploadPortfolioAsync.loading}
                    accept=".pdf,.png,.jpg,.jpeg"
                    helperText="Upload portfolio PDF or Image details"
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

/**
 * Reusable layout sub-section for managing arrays of structured objects.
 * Handles edit listings, adding cards, and formatting fields dynamically.
 */
function ArraySection({
  title,
  items = [],
  onSave,
  renderItem,
  formFields = [],
  defaultItem = {},
  beforeSave = (i) => i,
  submitTrigger,
  isUpdating = false
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ ...defaultItem })

  const handleAddFieldChange = (key, val) => {
    setFormData(prev => ({
      ...prev,
      [key]: val
    }))
  }

  const handleAddItem = (e) => {
    e.preventDefault()
    
    // Simple verification
    const missingRequired = formFields.some(f => f.required && !formData[f.key])
    if (missingRequired) {
      alert("Please fill in all required fields.")
      return
    }

    const processed = beforeSave({ ...formData })
    const updatedItems = [...items, processed]
    
    onSave(updatedItems)
    
    // Close & reset
    setFormData({ ...defaultItem })
    setShowAddForm(false)
  }

  const handleDeleteItem = (indexToDelete) => {
    const updated = items.filter((_, idx) => idx !== indexToDelete)
    onSave(updated)
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center border-b dark:border-slate-850 pb-2">
        <h3 className="text-md font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Close Form" : "➕ Add Item"}
        </Button>
      </div>

      {/* Add Item form */}
      {showAddForm && (
        <form onSubmit={handleAddItem} className="bg-gray-50/50 dark:bg-slate-950/20 border dark:border-slate-850 p-4 rounded-2xl space-y-4 animate-scaleUp">
          <div className="grid gap-4 sm:grid-cols-2">
            {formFields.map(field => {
              if (field.type === "checkbox") {
                return (
                  <label key={field.key} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-slate-350 select-none sm:col-span-2 pt-2">
                    <input
                      type="checkbox"
                      checked={!!formData[field.key]}
                      onChange={(e) => handleAddFieldChange(field.key, e.target.checked)}
                      className="rounded border-gray-300 dark:border-slate-700 text-indigo-650 focus:ring-indigo-500 bg-white dark:bg-slate-900 w-4 h-4"
                    />
                    <span>{field.label}</span>
                  </label>
                )
              }

              return (
                <div key={field.key} className={field.as === "textarea" ? "sm:col-span-2" : ""}>
                  <Input
                    label={field.label}
                    as={field.as}
                    type={field.type || "text"}
                    placeholder={field.placeholder || ""}
                    value={formData[field.key] || ""}
                    onChange={(e) => handleAddFieldChange(field.key, e.target.value)}
                    className={field.className || ""}
                    required={field.required}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit" variant="primary" size="sm">
              Confirm Add
            </Button>
          </div>
        </form>
      )}

      {/* List of current items */}
      <div className="space-y-3.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-150 dark:border-slate-800 shadow-xs relative hover:border-gray-200 dark:hover:border-slate-705 transition">
            <div className="flex-1 text-xs">
              {renderItem(item)}
            </div>
            <button
              type="button"
              onClick={() => handleDeleteItem(idx)}
              className="text-gray-450 hover:text-red-500 text-sm font-semibold select-none transition"
              title="Delete Item"
            >
              ✕
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-gray-450 dark:text-slate-500 italic text-center py-6">No records added yet.</p>
        )}
      </div>

      {items.length > 0 && (
        <div className="flex justify-end pt-4 border-t dark:border-slate-850">
          <Button onClick={submitTrigger} variant="primary" loading={isUpdating}>
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  )
}

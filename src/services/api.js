const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Helper to get headers with token
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem("token")
  const headers = {}
  if (!isMultipart) {
    headers["Content-Type"] = "application/json"
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

// Global request wrapper
const request = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`
  const headers = getHeaders(options.body instanceof FormData)
  
  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }
    
    return data
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error)
    throw error
  }
}

export const api = {
  // Auth
  login: async (email, password) => {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    })
  },
  
  signup: async (name, email, password) => {
    return request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    })
  },

  // Jobs
  getJobs: async () => {
    return request("/jobs")
  },

  createJob: async (jobData) => {
    return request("/jobs", {
      method: "POST",
      body: JSON.stringify(jobData)
    })
  },

  updateJob: async (id, jobData) => {
    return request(`/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(jobData)
    })
  },

  deleteJob: async (id) => {
    return request(`/jobs/${id}`, {
      method: "DELETE"
    })
  },

  // Checklist
  updateChecklist: async (id, checklist) => {
    return request(`/jobs/${id}/checklist`, {
      method: "PUT",
      body: JSON.stringify({ checklist })
    })
  },

  // Analytics
  getAnalytics: async () => {
    return request("/jobs/analytics")
  },

  // Profile Links
  updateProfileLinks: async (links) => {
    return request("/profile-links", {
      method: "PUT",
      body: JSON.stringify(links)
    })
  },

  // Resume Upload
  uploadResume: async (formData) => {
    return request("/resume/upload", {
      method: "POST",
      body: formData
    })
  },

  // AI Endpoints
  generatePrep: async (jobId) => {
    return request("/ai/prep", {
      method: "POST",
      body: JSON.stringify({ jobId })
    })
  },

  analyzeResume: async (resumeText, jobDescription) => {
    return request("/ai/resume-analyze", {
      method: "POST",
      body: JSON.stringify({ resumeText, jobDescription })
    })
  },

  generateApplyAssist: async (jobId) => {
    return request("/ai/apply-assist", {
      method: "POST",
      body: JSON.stringify({ jobId })
    })
  }
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

if (!import.meta.env.VITE_API_URL) {
  console.warn("⚠️ [Vite API Config]: VITE_API_URL is undefined in the environment. Defaulting to local port 5000 API gateway.")
}

// Fetch helper configuration
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

// Global centralized request interceptor
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
    
    // Auto-logout user if token is expired/invalid (401 Unauthorized)
    if (response.status === 401) {
      console.warn("⚠️ API Warning: Authorization token is invalid or has expired. Redirecting to login.")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
      throw new Error("Your session has expired. Please log in again.")
    }

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP Request failed with status ${response.status}`)
    }
    
    return data
  } catch (error) {
    console.error(`❌ API Request Exception [${options.method || "GET"} ${endpoint}]:`, error.message)
    throw error
  }
}

export const api = {
  // Auth API
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

  // Jobs API
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

  // Checklist API
  updateChecklist: async (id, checklist) => {
    return request(`/jobs/${id}/checklist`, {
      method: "PUT",
      body: JSON.stringify({ checklist })
    })
  },

  // Analytics API
  getAnalytics: async () => {
    return request("/jobs/analytics")
  },

  // Profile Links API
  updateProfileLinks: async (links) => {
    return request("/profile-links", {
      method: "PUT",
      body: JSON.stringify(links)
    })
  },

  // Resume Upload API
  uploadResume: async (formData) => {
    return request("/resume/upload", {
      method: "POST",
      body: formData
    })
  },

  // Gemini AI API
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

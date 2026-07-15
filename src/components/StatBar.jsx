import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

export default function StatBar({ jobs = [] }) {
  const [showCharts, setShowCharts] = useState(false)
  const [timelinePeriod, setTimelinePeriod] = useState("day") // "day" or "week"

  // 1. Basic counts
  const total = jobs.length
  const saved = jobs.filter(j => j.status === "saved").length
  const applied = jobs.filter(j => j.status === "applied").length
  const screening = jobs.filter(j => j.status === "screening").length
  const interviewed = jobs.filter(j => j.status === "interview" || j.status === "offer").length
  const offer = jobs.filter(j => j.status === "offer").length
  const rejected = jobs.filter(j => j.status === "rejected").length

  // 2. Conversion metrics: Interview success rate (Interviews -> Offers)
  const interviewSuccessRate = interviewed > 0 
    ? Math.round((offer / interviewed) * 100) 
    : 0

  // 3. Status distribution donut data
  const statusColors = {
    Saved: "#9ca3af",
    Applied: "#3b82f6",
    Screening: "#a855f7",
    Interview: "#f59e0b",
    Offer: "#10b981",
    Rejected: "#ef4444"
  }

  const pieData = [
    { name: "Saved", value: saved, color: statusColors.Saved },
    { name: "Applied", value: applied, color: statusColors.Applied },
    { name: "Screening", value: screening, color: statusColors.Screening },
    { name: "Interview", value: interviewed - offer, color: statusColors.Interview },
    { name: "Offer", value: offer, color: statusColors.Offer },
    { name: "Rejected", value: rejected, color: statusColors.Rejected }
  ].filter(item => item.value > 0)

  // 4. Timeline data (grouped by Day or Week)
  const getWeekStart = (dateStr) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return "Unknown"
      const day = date.getDay()
      const diff = date.getDate() - day
      const sunday = new Date(date.setDate(diff))
      return sunday.toISOString().split("T")[0]
    } catch {
      return "Unknown"
    }
  }

  const timelineMap = {}
  jobs.forEach(job => {
    if (job.appliedDate) {
      const dateStr = new Date(job.appliedDate).toISOString().split("T")[0]
      const periodKey = timelinePeriod === "day" ? dateStr : getWeekStart(dateStr)
      timelineMap[periodKey] = (timelineMap[periodKey] || 0) + 1
    }
  })

  const timelineData = Object.keys(timelineMap)
    .sort()
    .map(date => ({
      date,
      count: timelineMap[date]
    }))

  return (
    <div className="space-y-6 mb-8 max-w-5xl mx-auto w-full">
      {/* Counts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <StatCard label="Total Apps" count={total} color="bg-indigo-50/50 text-indigo-700 border-indigo-100" />
        <StatCard label="Saved" count={saved} color="bg-gray-50 text-gray-500 border-gray-150" />
        <StatCard label="Applied" count={applied} color="bg-blue-50 text-blue-700 border-blue-100" />
        <StatCard label="Screening" count={screening} color="bg-purple-50 text-purple-700 border-purple-100" />
        <StatCard label="Interviews" count={interviewed} color="bg-amber-50 text-amber-700 border-amber-100" />
        <StatCard label="Offers" count={offer} color="bg-emerald-50 text-emerald-700 border-emerald-100" />
      </div>

      {/* Analytics Toggle */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowCharts(!showCharts)}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-md hover:shadow-indigo-500/20"
        >
          {showCharts ? "📊 Hide Visual Analytics" : "📊 View Visual Analytics"}
        </button>
      </div>

      {/* Expanded Charts Panel */}
      {showCharts && (
        <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm grid md:grid-cols-3 gap-6 items-stretch animate-fadeIn">
          {/* Donut Chart: Status distribution */}
          <div className="border rounded-xl p-4 flex flex-col items-center justify-between min-h-[300px]">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center w-full">Status Breakdown</h4>
            {pieData.length > 0 ? (
              <div className="w-full h-48 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} applications`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic my-auto">No status records to display.</p>
            )}
            
            {/* Custom Legend */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1 text-[10px] font-semibold text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Area Chart: Applications timeline */}
          <div className="border rounded-xl p-4 flex flex-col justify-between min-h-[300px] md:col-span-2">
            <div className="flex justify-between items-center w-full border-b pb-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Application Volume</h4>
              <div className="flex bg-gray-100 rounded-lg p-0.5 border">
                <button
                  onClick={() => setTimelinePeriod("day")}
                  className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${timelinePeriod === "day" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500"}`}
                >
                  Day
                </button>
                <button
                  onClick={() => setTimelinePeriod("week")}
                  className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${timelinePeriod === "week" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500"}`}
                >
                  Week
                </button>
              </div>
            </div>

            {timelineData.length > 0 ? (
              <div className="w-full h-44 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#9ca3af" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 9 }} stroke="#9ca3af" />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" name="Applications" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic my-auto text-center">No dates recorded yet.</p>
            )}

            {/* Stat Card: Interview conversion rate */}
            <div className="mt-4 pt-3 border-t flex justify-between items-center px-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Interview Conversion Rate</span>
                <span className="text-xs text-gray-500">Percentage of interviews converting to offers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-900 block">{interviewSuccessRate}%</span>
                </div>
                <div className="w-14 bg-gray-150 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(interviewSuccessRate, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, count, color }) {
  return (
    <div className={`p-4 rounded-xl border text-center shadow-xs transition duration-200 hover:-translate-y-[1px] ${color}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">{label}</p>
      <p className="text-2xl font-black mt-1">{count}</p>
    </div>
  )
}

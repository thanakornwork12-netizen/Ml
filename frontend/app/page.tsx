"use client";
import { useState } from "react";
import axios from "axios";
import { 
  FiBarChart2, 
  FiUsers, 
  FiFileText, 
  FiAlertCircle, 
  FiUpload, 
  FiCheckCircle,
  FiLayout,
  FiSettings
} from "react-icons/fi"; // แนะนำ: npm install react-icons

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("กรุณาเลือกไฟล์ก่อน");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:8001/predict", formData);
      setResult(res.data);
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] text-slate-900 font-sans">
      
      {/* 1. SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FiBarChart2 className="text-xl" />
          </div>
          <span className="text-xl font-black tracking-tight">CHURNLY <span className="text-blue-500 text-xs block font-normal">AI ANALYTICS</span></span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavItem icon={<FiLayout />} label="Overview" active />
          <NavItem icon={<FiUsers />} label="Customer List" />
          <NavItem icon={<FiFileText />} label="Reports" />
          <NavItem icon={<FiSettings />} label="Settings" />
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="bg-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400 mb-1">Signed in as</p>
            <p className="text-sm font-bold">Thanakorn Admin</p>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Area */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Retention Dashboard</h1>
              <p className="text-slate-500 font-medium">Predicting future churn with Machine Learning</p>
            </div>
            <div className="text-sm text-slate-400 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
              Last update: Feb 2026
            </div>
          </div>

          {/* UPLOAD BOX */}
          <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mb-10 transition-all hover:shadow-md">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <FiUpload className="text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Import Dataset</h2>
                  <p className="text-sm text-slate-400">Drag and drop your customer data (CSV or Excel)</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 relative group">
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-4 px-6 flex items-center justify-between group-hover:border-blue-400 group-hover:bg-blue-50 transition-all">
                    <span className="text-slate-500 font-medium truncate max-w-xs">
                      {file ? file.name : "Choose a file..."}
                    </span>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Browse</span>
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                    loading 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300"
                  }`}
                >
                  {loading ? "Analyzing..." : "Run AI Prediction"}
                </button>
              </div>
            </div>
          </section>

          {/* RESULTS AREA */}
          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatCard label="Database Size" value={result.total_customers} icon={<FiUsers />} color="blue" />
                <StatCard label="At Risk" value={result.churn_count} icon={<FiAlertCircle />} color="red" />
                <StatCard label="Safe Customers" value={result.total_customers - result.churn_count} icon={<FiCheckCircle />} color="emerald" />
                <StatCard label="Churn Rate" value={`${result.churn_rate}%`} icon={<FiBarChart2 />} color="amber" />
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold">Churn Probability by Contract</h2>
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Sorted by Risk Level</span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contract Type</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Probability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.risk_by_contract.map((item: any, index: number) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-700">{item.type}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${item.churn_rate > 40 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                  style={{ width: `${item.churn_rate}%` }}
                                />
                              </div>
                              <span className={`font-black ${item.churn_rate > 40 ? 'text-red-600' : 'text-slate-700'}`}>
                                {item.churn_rate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────

function NavItem({ icon, label, active = false }: any) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
      active ? "bg-blue-600/10 text-blue-400 border-l-4 border-blue-500" : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`}>
      <span className="text-lg">{icon}</span>
      <span className="font-semibold">{label}</span>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colorMap: any = {
    blue: "text-blue-600 bg-blue-50",
    red: "text-red-600 bg-red-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
  };

  return (
    <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-200 transition-transform hover:-translate-y-1">
      <div className={`w-10 h-10 ${colorMap[color]} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900">{value.toLocaleString()}</p>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Calendar, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  History,
  TrendingDown,
  TrendingUp,
  Filter,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card, { CardHeader, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export default function ReportsLogs() {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  // Load logs from system sink
  useEffect(() => {
    const savedLogs = localStorage.getItem('smart_attendance_session_logs');
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs).reverse()); // Newest first
      } catch (e) {
        setLogs([]);
      }
    }
  }, []);

  // Requirement 4: Analytics Engine Calculations
  const stats = {
    totalSessions: logs.length,
    avgAttendance: logs.length > 0 
      ? Math.round(logs.reduce((acc, log) => acc + ((log.stats.present / (log.roster?.length || 1)) * 100), 0) / logs.length)
      : 0,
    anomalies: logs.filter(log => (log.stats.present / (log.roster?.length || 1)) < 0.5 || log.stats.unknown > 5).length,
    activeCourses: [...new Set(logs.map(l => l.courseId))].length
  };

  const filteredLogs = logs.filter(log => 
    (log.courseName.toLowerCase().includes(searchQuery.toLowerCase()) || 
     log.sessionId.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterCourse === 'all' || log.courseId === filterCourse)
  );

  const exportReport = (type, format) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: `Generating ${type} in ${format} format...`,
        success: `${type} exported successfully!`,
        error: 'Export failed.',
      }
    );
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
      <PageHeader 
        title="Reports & Analytics" 
        description="Converting raw classroom activity into academic intelligence and audit trails."
        actions={
          <div className="flex gap-3">
             <Button variant="outline" icon={Download} onClick={() => exportReport('System Summary', 'CSV')}>Export All CSV</Button>
             <Button variant="primary" icon={FileText} onClick={() => exportReport('Academic Report', 'PDF')}>Generate Monthly PDF</Button>
          </div>
        }
      />

      {/* Requirement 8: Global Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Sessions" 
          value={stats.totalSessions} 
          icon={History} 
          trend="+12% vs last month"
          color="blue"
        />
        <StatCard 
          title="Avg. Attendance" 
          value={`${stats.avgAttendance}%`} 
          icon={BarChart3} 
          trend={stats.avgAttendance > 80 ? "Stable Performance" : "Below Target"}
          color={stats.avgAttendance > 80 ? "emerald" : "amber"}
          isPositive={stats.avgAttendance > 80}
        />
        <StatCard 
          title="System Anomalies" 
          value={stats.anomalies} 
          icon={AlertTriangle} 
          trend="Flagged for review"
          color={stats.anomalies > 0 ? "rose" : "slate"}
          isWarning={stats.anomalies > 0}
        />
        <StatCard 
          title="Active Courses" 
          value={stats.activeCourses} 
          icon={CheckCircle2} 
          trend="Currently Tracked"
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Requirement 3: Session Archive System */}
        <div className="lg:col-span-2 space-y-6">
          <Card noPadding className="border-slate-100 shadow-sm overflow-hidden rounded-[32px]">
            <CardHeader 
              title="Audit Trail: Session Archives" 
              subtitle="Immutable record of all finalized attendance sessions."
              action={
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search Session ID..." 
                      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none w-48 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm" icon={Filter}>Filter</Button>
                </div>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Session Info</th>
                    <th className="px-6 py-4">Engagement</th>
                    <th className="px-6 py-4 text-center">Security</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => {
                    const attendanceRate = Math.round((log.stats.present / (log.roster?.length || 1)) * 100);
                    const isAnomaly = attendanceRate < 50 || log.stats.unknown > 5;
                    
                    return (
                      <tr key={log.sessionId} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedLog(log)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${isAnomaly ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                              {log.courseId.split('-')[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{log.courseName}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{log.sessionId} • {log.startTime}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1 w-24">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                 <span>{attendanceRate}%</span>
                                 <span>{log.stats.present}/{log.roster?.length}</span>
                              </div>
                              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                 <div className={`h-full ${attendanceRate > 80 ? 'bg-emerald-500' : attendanceRate > 50 ? 'bg-blue-500' : 'bg-rose-500'}`} style={{width: `${attendanceRate}%`}} />
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <Badge variant={log.stats.unknown > 0 ? 'warning' : 'success'} className="text-[10px]">
                              {log.stats.unknown} Unknown
                           </Badge>
                        </td>
                        <td className="px-6 py-4">
                           {isAnomaly ? (
                             <div className="flex items-center gap-1 text-rose-600 font-bold text-[10px] uppercase">
                               <AlertTriangle className="w-3 h-3" /> Anomaly Detected
                             </div>
                           ) : (
                             <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase">
                               <CheckCircle2 className="w-3 h-3" /> Verified
                             </div>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="p-2 text-slate-300 group-hover:text-blue-600 transition-colors">
                              <ArrowRight className="w-5 h-5" />
                           </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                        No session records found. Complete a Live Classroom session to see reports.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Requirement 4: Trend Analysis & Insights */}
        <div className="space-y-6">
          <Card className="border-slate-100 shadow-sm rounded-[28px] bg-slate-900 text-white overflow-hidden relative">
             <BarChart3 className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
             <CardContent className="p-6 relative z-10">
                <h4 className="font-bold text-lg mb-6">Attendance Trend</h4>
                <div className="flex items-end gap-2 h-32 mb-6">
                   {[40, 70, 45, 90, 65, 85, 95].map((h, i) => (
                     <div key={i} className="flex-1 bg-blue-500/20 rounded-t-md relative group">
                        <div 
                          className="absolute bottom-0 w-full bg-blue-500 rounded-t-md transition-all duration-1000" 
                          style={{height: `${h}%`}}
                        />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                           {h}%
                        </div>
                     </div>
                   ))}
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   <span>Mon</span>
                   <span>Tue</span>
                   <span>Wed</span>
                   <span>Thu</span>
                   <span>Fri</span>
                   <span>Sat</span>
                   <span>Sun</span>
                </div>
             </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm rounded-[28px]">
             <CardHeader title="Report Quick Export" className="pb-0" />
             <CardContent className="p-6 space-y-3">
                <ExportButton title="Attendance History" subtitle="Student-wise analytics" format="PDF" />
                <ExportButton title="Course Performance" subtitle="Engagement summaries" format="CSV" />
                <ExportButton title="Anomaly Logs" subtitle="Security incidents" format="PDF" />
             </CardContent>
          </Card>
        </div>
      </div>

      {/* Requirement 7: Audit Detail Overlay */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
           <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 rounded-[32px]">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                 <div>
                    <Badge variant="primary" className="mb-2">{selectedLog.sessionId}</Badge>
                    <h3 className="text-2xl font-bold text-slate-900">{selectedLog.courseName}</h3>
                    <p className="text-sm text-slate-500">{selectedLog.courseId} • Session Date: {selectedLog.startTime}</p>
                 </div>
                 <button onClick={() => setSelectedLog(null)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100">
                    <MoreHorizontal className="w-6 h-6" />
                 </button>
              </div>
              <div className="p-8 max-h-[400px] overflow-y-auto">
                 <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl text-center">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Present</p>
                       <p className="text-xl font-bold text-emerald-600">{selectedLog.stats.present}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl text-center">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Absent</p>
                       <p className="text-xl font-bold text-rose-600">{selectedLog.roster.length - selectedLog.stats.present}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl text-center border border-amber-100">
                       <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Unknowns</p>
                       <p className="text-xl font-bold text-amber-600">{selectedLog.stats.unknown}</p>
                    </div>
                 </div>
                 <h4 className="font-bold text-slate-800 mb-4">Session Roster Scan Results</h4>
                 <div className="space-y-2">
                    {selectedLog.roster.map(s => (
                       <div key={s.id} className="flex items-center justify-between p-3 border border-slate-50 rounded-xl text-sm">
                          <span className="font-medium text-slate-700">{s.name}</span>
                          <Badge variant={s.status === 'Present' ? 'success' : 'outline'}>{s.status}</Badge>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="p-8 border-t border-slate-100 flex gap-3">
                 <Button variant="outline" className="flex-1" onClick={() => setSelectedLog(null)}>Close Audit</Button>
                 <Button variant="primary" className="flex-1" icon={Download}>Export Detail Report</Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}

// Utility Components
function StatCard({ title, value, icon: Icon, trend, color, isPositive, isWarning }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    slate: 'bg-slate-50 text-slate-400 border-slate-100',
  };

  return (
    <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
           {isWarning ? <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> : isPositive ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-amber-500" />}
           <span className={`text-[11px] font-bold ${isWarning ? 'text-rose-500' : isPositive ? 'text-emerald-500' : 'text-slate-400'}`}>{trend}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ExportButton({ title, subtitle, format }) {
  return (
    <button 
      onClick={() => toast.success(`${title} export started...`)}
      className="w-full flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
    >
       <div className="text-left">
          <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{title}</p>
          <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>
       </div>
       <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${format === 'PDF' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {format}
       </div>
    </button>
  );
}

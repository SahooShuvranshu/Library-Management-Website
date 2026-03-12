import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { BookOpen, Users, Clock, ShieldAlert } from "lucide-react";

export default function AdminOverview({ stats, userActivityData, popularBooksData, mockChartData }: any) {
  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 sm:gap-6 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Total Books</p>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900">{stats.totalBooks}</p>
          </div>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 sm:gap-6 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Active Users</p>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900">{stats.activeUsers}</p>
          </div>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 sm:gap-6 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
            <Clock className="h-7 w-7" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Borrowed</p>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900">{stats.borrowedBooks}</p>
          </div>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 sm:gap-6 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shadow-sm">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Overdue</p>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900">{stats.overdueBooks}</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* User Activity Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-slate-900">Top Active Users</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" name="Books Borrowed" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Books Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-slate-900">Most Popular Books</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularBooksData} layout="vertical" margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
                <YAxis dataKey="title" type="category" width={120} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" name="Times Borrowed" fill="#10b981" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Borrowing Trends Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-6 text-slate-900">Borrowing Trends</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorBorrowed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip 
                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
                contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" />
              <Area type="monotone" dataKey="borrowed" name="Borrowed" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrowed)" />
              <Area type="monotone" dataKey="returned" name="Returned" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReturned)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

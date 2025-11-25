import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Event, Venue } from '../types';

interface AnalyticsProps {
  events: Event[];
  venues: Venue[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ events, venues }) => {
  
  // 1. Events by Department
  const deptData = events.reduce((acc, curr) => {
    const existing = acc.find(i => i.name === curr.department);
    if (existing) existing.value++;
    else acc.push({ name: curr.department, value: 1 });
    return acc;
  }, [] as { name: string; value: number }[]);

  // 2. Venue Utilization
  const venueData = venues.map(v => ({
    name: v.name.split(' ')[0], // Shorten name
    value: events.filter(e => e.venueId === v.id && e.status === 'APPROVED').length
  }));

  // 3. Compliance (Reports submitted vs Approved Events that passed)
  const passedEvents = events.filter(e => e.status === 'APPROVED' || e.status === 'COMPLETED');
  const compliant = passedEvents.filter(e => e.status === 'COMPLETED').length;
  const complianceData = [
    { name: 'Compliant', value: compliant },
    { name: 'Pending', value: passedEvents.length - compliant }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Platform Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">Events by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} tick={{fill: '#64748b'}} />
                <YAxis fontSize={12} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Venue Utilization */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">Venue Utilization</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={venueData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                 <XAxis type="number" fontSize={12} />
                 <YAxis dataKey="name" type="category" width={100} fontSize={11} tick={{fill: '#64748b'}} />
                 <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                 <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Pie Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">Report Submission Compliance</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 text-sm text-slate-600 dark:text-slate-400 mt-2">
              <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>Compliant</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>Pending Report</div>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg shadow-blue-200 dark:shadow-none">
                <p className="text-blue-100 text-sm font-medium uppercase">Total Events</p>
                <p className="text-4xl font-bold mt-2">{events.length}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                <p className="text-emerald-100 text-sm font-medium uppercase">Avg Attendance</p>
                <p className="text-4xl font-bold mt-2">
                    {Math.round(events.reduce((acc, curr) => acc + (curr.report?.attendance || 0), 0) / (compliant || 1))}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
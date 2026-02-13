
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { NoteResponse, GraphStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { StickyNote, Share2, Tags, Zap, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [recentNotes, setRecentNotes] = useState<NoteResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, notesData] = await Promise.all([
          api.getGraphStats(),
          api.listNotes({ limit: 5 })
        ]);
        setStats(statsData);
        setRecentNotes(notesData.items);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  const typeData = stats?.notes_by_type.map(item => ({
    name: item.note_type,
    count: item.count
  })) || [];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-slate-500 dark:text-slate-400">Here's what's happening in your digital brain.</p>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={StickyNote} label="Total Notes" value={stats?.total_notes || 0} color="bg-indigo-500" />
        <StatCard icon={Share2} label="Links" value={stats?.total_links || 0} color="bg-emerald-500" />
        <StatCard icon={Tags} label="Tags" value={stats?.total_tags || 0} color="bg-amber-500" />
        <StatCard icon={Zap} label="Density" value={stats?.density.toFixed(3) || "0.00"} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Type Distribution */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart size={20} className="text-indigo-500" /> Note Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Notes */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock size={20} className="text-indigo-500" /> Recent Activity
            </h2>
            <Link to="/notes" className="text-indigo-600 text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentNotes.map(note => (
              <Link 
                key={note.id} 
                to={`/notes/${note.id}`}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getTypeColor(note.note_type)}`} />
                  <div>
                    <h3 className="font-medium group-hover:text-indigo-600 transition-colors">{note.title}</h3>
                    <p className="text-xs text-slate-500">{new Date(note.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: any, label: string, value: string | number, color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-xl ${color} text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const getTypeColor = (type: string) => {
  switch (type) {
    case 'fleeting': return 'bg-slate-400';
    case 'literature': return 'bg-emerald-500';
    case 'permanent': return 'bg-indigo-500';
    case 'hub': return 'bg-amber-500';
    default: return 'bg-slate-500';
  }
};

export default Dashboard;

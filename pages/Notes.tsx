
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NoteResponse, NoteType } from '../types';
// Fixed: Added missing StickyNote import
import { Search, Filter, Grid, List as ListIcon, Pin, Archive, Plus, StickyNote } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    note_type: '' as NoteType | '',
    pinned: false,
    archived: false,
    search: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const response = await api.listNotes({
          note_type: filters.note_type || undefined,
          pinned: filters.pinned || undefined,
          archived: filters.archived || undefined,
          limit: 100
        });
        
        let filtered = response.items;
        if (filters.search) {
          filtered = filtered.filter(n => 
            n.title.toLowerCase().includes(filters.search.toLowerCase()) || 
            n.content.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        setNotes(filtered);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-slate-500">Manage and explore your atomic ideas.</p>
        </div>
        <button 
          onClick={() => navigate('/notes/new')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} /> Create Note
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search within current list..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <div className="flex items-center gap-2">
          <select 
            className="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
            value={filters.note_type}
            onChange={(e) => setFilters(prev => ({ ...prev, note_type: e.target.value as any }))}
          >
            <option value="">All Types</option>
            {Object.values(NoteType).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>

          <button 
            onClick={() => setFilters(prev => ({ ...prev, pinned: !prev.pinned }))}
            className={`p-2 rounded-lg border border-slate-200 dark:border-slate-800 ${filters.pinned ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 border-indigo-200' : ''}`}
          >
            <Pin size={20} />
          </button>

          <button 
            onClick={() => setFilters(prev => ({ ...prev, archived: !prev.archived }))}
            className={`p-2 rounded-lg border border-slate-200 dark:border-slate-800 ${filters.archived ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 border-amber-200' : ''}`}
          >
            <Archive size={20} />
          </button>

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />

          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600' : 'text-slate-400'}`}
          >
            <Grid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600' : 'text-slate-400'}`}
          >
            <ListIcon size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <StickyNote size={64} className="mb-4 opacity-20" />
          <p>No notes found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {notes.map(note => (
            <Link 
              key={note.id} 
              to={`/notes/${note.id}`}
              className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group relative flex flex-col ${viewMode === 'list' ? 'flex-row items-center justify-between py-4' : ''}`}
            >
              <div className={viewMode === 'list' ? 'flex items-center gap-4' : ''}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getTypeColor(note.note_type)}`} />
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{note.note_type}</span>
                  </div>
                  <div className="flex gap-2">
                    {note.is_pinned && <Pin size={14} className="text-indigo-500" />}
                    {note.archived_at && <Archive size={14} className="text-amber-500" />}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{note.title}</h3>
                {viewMode === 'grid' && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                    {note.content.replace(/[#*`]/g, '')}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-auto">
                  {note.tags.slice(0, 3).map(tag => (
                    <span key={tag.id} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-medium">
                      #{tag.name}
                    </span>
                  ))}
                  {note.tags.length > 3 && <span className="text-[10px] text-slate-400">+{note.tags.length - 3}</span>}
                </div>
              </div>
              
              {viewMode === 'list' && (
                <div className="text-xs text-slate-400 font-medium">
                  {new Date(note.updated_at).toLocaleDateString()}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'fleeting': return 'bg-slate-400';
    case 'literature': return 'bg-emerald-500';
    case 'permanent': return 'bg-indigo-500';
    case 'hub': return 'bg-amber-500';
    default: return 'bg-slate-500';
  }
};

export default Notes;

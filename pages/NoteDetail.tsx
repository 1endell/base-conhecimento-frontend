
import React, { useState, useEffect } from 'react';
// Fixed: Added missing Link import
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { NoteDetail as NoteDetailType, NoteType, TagBrief } from '../types';
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  Trash2, 
  Pin, 
  Archive, 
  Link as LinkIcon, 
  ChevronRight,
  Clock,
  History,
  MoreVertical,
  X
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<NoteDetailType | null>(null);
  const [isEditing, setIsEditing] = useState(id === 'new');
  const [editData, setEditData] = useState({
    title: '',
    content: '',
    note_type: NoteType.FLEETING,
    tag_ids: [] as number[]
  });
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<TagBrief[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tags = await api.listTags();
        setAllTags(tags);

        if (id && id !== 'new') {
          const noteData = await api.getNote(id);
          setNote(noteData);
          setEditData({
            title: noteData.title,
            content: noteData.content,
            note_type: noteData.note_type,
            tag_ids: noteData.tags.map(t => t.id)
          });
        }
      } catch (error) {
        console.error("Error fetching note:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    try {
      if (id === 'new') {
        const created = await api.createNote(editData);
        navigate(`/notes/${created.id}`);
      } else if (id) {
        const updated = await api.updateNote(id, editData);
        const refreshed = await api.getNote(id);
        setNote(refreshed);
        setIsEditing(false);
      }
    } catch (error) {
      alert("Failed to save note");
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("Delete this note forever?")) return;
    await api.deleteNote(id);
    navigate('/notes');
  };

  const togglePin = async () => {
    if (!id || !note) return;
    const action = note.is_pinned ? api.unpinNote(id) : api.pinNote(id);
    const updated = await action;
    setNote({ ...note, is_pinned: updated.is_pinned });
  };

  if (loading) return <div>Loading...</div>;
  if (!note && id !== 'new') return <div>Note not found.</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 text-slate-500">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex gap-2">
          {id !== 'new' && (
            <>
              <button onClick={togglePin} className={`p-2 rounded-lg border border-slate-200 dark:border-slate-800 ${note?.is_pinned ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                <Pin size={20} />
              </button>
              <button onClick={handleDelete} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-red-500 hover:bg-red-50">
                <Trash2 size={20} />
              </button>
            </>
          )}
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isEditing ? <><Save size={20} /> Save</> : <><Edit2 size={20} /> Edit</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {isEditing ? (
              <div className="space-y-4">
                <input 
                  className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 outline-none placeholder:text-slate-300"
                  placeholder="Note Title"
                  value={editData.title}
                  onChange={e => setEditData({ ...editData, title: e.target.value })}
                />
                <div className="flex gap-4">
                  <select 
                    className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-1 text-sm border-none"
                    value={editData.note_type}
                    onChange={e => setEditData({ ...editData, note_type: e.target.value as NoteType })}
                  >
                    {Object.values(NoteType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <textarea 
                  className="w-full h-96 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm leading-relaxed"
                  placeholder="Write your markdown content here... Use [[Note Title]] to link."
                  value={editData.content}
                  onChange={e => setEditData({ ...editData, content: e.target.value })}
                />
              </div>
            ) : (
              <article>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${getTypeColorClass(note!.note_type)}`}>
                    {note!.note_type}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Updated {new Date(note!.updated_at).toLocaleDateString()}</span>
                </div>
                <h1 className="text-4xl font-black mb-8 leading-tight">{note!.title}</h1>
                <MarkdownRenderer content={note!.content} />
              </article>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          {/* Metadata/Tags */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                <div className="w-full space-y-2">
                  <select 
                    multiple
                    className="w-full h-32 bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border-none text-sm"
                    value={editData.tag_ids.map(String)}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, opt => Number(opt.value));
                      setEditData({ ...editData, tag_ids: selected });
                    }}
                  >
                    {allTags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
                  </select>
                  <p className="text-[10px] text-slate-400">Ctrl/Cmd + click to multi-select</p>
                </div>
              ) : (
                note?.tags.map(tag => (
                  <span key={tag.id} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold">
                    #{tag.name}
                  </span>
                ))
              )}
            </div>
          </section>

          {/* Links and Backlinks */}
          {!isEditing && note && (
            <>
              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <LinkIcon size={16} /> Outgoing Links
                </h3>
                <div className="space-y-3">
                  {note.outgoing_links.length > 0 ? note.outgoing_links.map(link => (
                    <Link key={link.id} to={`/notes/${link.target_id}`} className="block group">
                      <div className="flex items-center justify-between text-sm hover:text-indigo-600 transition-colors">
                        <span className="line-clamp-1 font-medium italic">Target Note</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500" />
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase">{link.link_type}</div>
                    </Link>
                  )) : <p className="text-xs text-slate-400 italic">No outgoing links</p>}
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <History size={16} /> Backlinks
                </h3>
                <div className="space-y-3">
                  {note.incoming_links.length > 0 ? note.incoming_links.map(link => (
                    <Link key={link.id} to={`/notes/${link.source_id}`} className="block group">
                      <div className="flex items-center justify-between text-sm hover:text-indigo-600 transition-colors">
                        <span className="line-clamp-1 font-medium italic">Referencing Note</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500" />
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase">{link.link_type}</div>
                    </Link>
                  )) : <p className="text-xs text-slate-400 italic">No incoming links</p>}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const getTypeColorClass = (type: NoteType) => {
  switch (type) {
    case NoteType.FLEETING: return 'bg-slate-500';
    case NoteType.LITERATURE: return 'bg-emerald-500';
    case NoteType.PERMANENT: return 'bg-indigo-500';
    case NoteType.HUB: return 'bg-amber-500';
    default: return 'bg-slate-400';
  }
};

export default NoteDetail;


import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Brain } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const { access_token } = await api.login({
          username: formData.username,
          password: formData.password
        });
        localStorage.setItem('kd_access_token', access_token);
        navigate('/');
      } else {
        await api.register(formData);
        setIsLogin(true);
        alert("Registered successfully. Please log in.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/20">
            <Brain size={32} />
          </div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-slate-500 text-sm">Organize your digital second brain.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 ml-1 text-slate-700 dark:text-slate-300">Username</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 ml-1 text-slate-700 dark:text-slate-300">Email (Optional)</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 ml-1 text-slate-700 dark:text-slate-300">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : isLogin ? <><LogIn size={20} /> Sign In</> : <><UserPlus size={20} /> Register</>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-sm"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

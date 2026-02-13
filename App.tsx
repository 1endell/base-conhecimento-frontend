
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Notes from './pages/Notes';
import NoteDetail from './pages/NoteDetail';
import Graph from './pages/Graph';

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('kd_access_token');

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/*" 
        element={
          isAuthenticated ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/notes/:id" element={<NoteDetail />} />
                <Route path="/graph" element={<Graph />} />
                <Route path="/search" element={<div>Advanced Search (Coming Soon)</div>} />
                <Route path="/tags" element={<div>Tag Hierarchy (Coming Soon)</div>} />
                <Route path="/import" element={<div>Document Import (Coming Soon)</div>} />
                <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
    </Routes>
  );
};

export default App;

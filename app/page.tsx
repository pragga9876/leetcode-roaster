'use client';

import { useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleRoast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate roast');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f4eee1', color: '#1b2845', padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
      <div style={{ width: '100%', maxWidth: '480px', border: '2px solid #1a1a1a', padding: '2rem', backgroundColor: '#faf6ed', boxShadow: '6px 6px 0px 0px #1a1a1a' }}>
        
        <div style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', color: '#b82619', fontWeight: 'bold', marginBottom: '4px' }}>
            ✦ SPECIAL EDITION PRINT ✦
          </p>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2rem', fontWeight: '900', color: '#1b2845', textTransform: 'uppercase', margin: 0 }}>
            LeetCode Roast
          </h1>
          <p style={{ fontSize: '12px', color: '#555', marginTop: '6px', fontStyle: 'italic' }}>
            Enter a LeetCode handle for an instant vintage evaluation
          </p>
        </div>

        <form onSubmit={handleRoast} style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="e.g. pragga5678"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #1a1a1a', backgroundColor: '#f4eee1', color: '#1b2845', fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '10px', border: '1px solid #1a1a1a', backgroundColor: '#b82619', color: '#f4eee1', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '2px 2px 0px 0px #1a1a1a' }}
          >
            {loading ? 'Analyzing Stats...' : '☎ Generate Roast'}
          </button>
        </form>

        {error && (
          <div style={{ padding: '10px', marginBottom: '1.5rem', border: '1px solid #b82619', backgroundColor: '#fdf2f2', color: '#b82619', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>
            ⚠ {error}
          </div>
        )}

        {result && (
          <div style={{ border: '1px solid #1a1a1a', padding: '1rem', backgroundColor: '#f4eee1', boxShadow: '3px 3px 0px 0px #1a1a1a' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', paddingBottom: '12px', borderBottom: '1px solid #1a1a1a', fontSize: '11px', fontWeight: 'bold' }}>
              <div style={{ padding: '6px', border: '1px solid #1a1a1a', backgroundColor: '#faf6ed' }}>
                <span style={{ display: 'block', color: '#2e7d32' }}>EASY</span>
                <span style={{ fontSize: '14px' }}>{result.easy}</span>
              </div>
              <div style={{ padding: '6px', border: '1px solid #1a1a1a', backgroundColor: '#faf6ed' }}>
                <span style={{ display: 'block', color: '#ed6c02' }}>MED</span>
                <span style={{ fontSize: '14px' }}>{result.med}</span>
              </div>
              <div style={{ padding: '6px', border: '1px solid #1a1a1a', backgroundColor: '#faf6ed' }}>
                <span style={{ display: 'block', color: '#b82619' }}>HARD</span>
                <span style={{ fontSize: '14px' }}>{result.hard}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <p style={{ fontSize: '10px', color: '#b82619', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                — VERDICT FOR {result.username} —
              </p>
              <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '16px', color: '#1b2845', fontStyle: 'italic', marginTop: '6px' }}>
                "{result.roast}"
              </p>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', paddingTop: '12px', borderTop: '1px dashed #888', textAlign: 'center', fontSize: '10px', color: '#777' }}>
          leetcode-roaster v1.0
        </div>
      </div>
    </main>
  );
}
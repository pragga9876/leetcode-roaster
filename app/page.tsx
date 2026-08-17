'use client';

import { useState, useRef } from 'react';
import { domToPng } from 'modern-screenshot';

export default function Home() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFetch = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Something went wrong');
      } else {
        setData(result);
      }
    } catch (err) {
      setError('Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  const downloadPNG = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await domToPng(cardRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
      });

      const link = document.createElement('a');
      link.download = `${data.username}-leetcode-roast.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to generate image. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-extrabold text-red-500">LeetCode Roast Cards 🔥</h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter LeetCode Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white outline-none focus:border-red-500"
          />
          <button
            onClick={handleFetch}
            disabled={loading}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 font-bold rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Roasting...' : 'Roast'}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {data && (
          <div className="space-y-4">
            <div
              ref={cardRef}
              className="p-6 bg-slate-900 border-2 border-cyan-400 rounded-2xl shadow-2xl text-center space-y-4"
            >
              <h2 className="text-2xl font-bold text-cyan-300">@{data.username}</h2>

              <div className="flex justify-around py-2 border-y border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Easy</div>
                  <div className="text-xl font-bold text-green-400">{data.easy}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Medium</div>
                  <div className="text-xl font-bold text-yellow-400">{data.med}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Hard</div>
                  <div className="text-xl font-bold text-red-400">{data.hard}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-lg border-l-4 border-amber-500 text-left italic text-slate-200">
                "{data.roast}"
              </div>
            </div>

            <button
              onClick={downloadPNG}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 font-bold rounded-lg transition"
            >
              Download Card PNG
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
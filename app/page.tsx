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
        scale: 3,
        backgroundColor: '#f8fafc',
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
    <main className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Title Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            LeetCode Roast
          </h1>
          <p className="text-slate-600 text-sm font-medium">
            Enter a username to roast their LeetCode stats and skills.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-2 shadow-sm flex items-center gap-2">
          <input
            type="text"
            placeholder="LeetCode Username (e.g. pragga5678)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
            className="flex-1 bg-transparent px-3 py-2 text-slate-900 font-medium placeholder-slate-400 outline-none text-sm"
          />
          <button
            onClick={handleFetch}
            disabled={loading}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Roasting...' : 'Roast'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-center text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* Clean Roast Card */}
        {data && (
          <div className="space-y-4">
            <div
              ref={cardRef}
              className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-md space-y-5 text-slate-900"
            >
              {/* Username Header */}
              <div>
                <h2 className="text-2xl font-black text-slate-900">@{data.username}</h2>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <div>
                  <div className="text-xs font-bold text-emerald-600 uppercase">EASY</div>
                  <div className="text-2xl font-black text-slate-900">{data.easy}</div>
                </div>
                <div className="border-x border-slate-200">
                  <div className="text-xs font-bold text-amber-600 uppercase">MEDIUM</div>
                  <div className="text-2xl font-black text-slate-900">{data.med}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-red-600 uppercase">HARD</div>
                  <div className="text-2xl font-black text-slate-900">{data.hard}</div>
                </div>
              </div>

              {/* Clean Roast Content Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-slate-800 font-semibold text-sm leading-relaxed">
                  "{data.roast}"
                </p>
              </div>
            </div>

            {/* Export Action */}
            <button
              onClick={downloadPNG}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition shadow-sm"
            >
              Download Card PNG
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
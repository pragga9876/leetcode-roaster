'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas-pro';

export default function Home() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleRoast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    setIsFlipped(false);

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
      setTimeout(() => setIsFlipped(true), 150);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const downloadPNG = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#f0e6d2',
        scale: 2,
        useCORS: true,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${result?.username || 'leetcode'}-roast-card.png`;
      link.click();
    } catch (err) {
      console.error('Failed to generate PNG:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f0e6d2', color: '#111', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Courier Prime, monospace' }}>
      
      {/* Input Form */}
      <div style={{ width: '100%', maxWidth: '380px', marginBottom: '1.5rem' }}>
        <form onSubmit={handleRoast}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ flex: 1, padding: '12px', border: '3px solid #111', backgroundColor: '#fff', color: '#111', fontSize: '14px', fontWeight: 'bold', outline: 'none', boxShadow: '3px 3px 0px 0px #111' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '12px 18px', border: '3px solid #111', backgroundColor: '#F5C242', color: '#111', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '3px 3px 0px 0px #111' }}
            >
              {loading ? 'Shuffling...' : '♠ Roast'}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ marginTop: '12px', padding: '10px', border: '2px solid #b82619', backgroundColor: '#fdf2f2', color: '#b82619', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>
            ⚠ {error}
          </div>
        )}
      </div>

      {/* 3D Playing Card Frame */}
      <div className="perspective-1000" style={{ width: '380px', height: '560px' }}>
        <div className={`transform-style-3d ${isFlipped ? 'flipped' : ''}`} style={{ width: '100%', height: '100%', position: 'relative' }}>
          
          {/* ================= CARD BACK (UNFLIPPED) ================= */}
          <div className="backface-hidden" style={{ position: 'absolute', top: 0, left: 0, width: '380px', height: '560px', border: '4px solid #111', borderRadius: '16px', backgroundColor: '#F5C242', padding: '12px', boxShadow: '8px 8px 0px 0px #111', boxSizing: 'border-box' }}>
            <div style={{ border: '2px dashed #111', width: '100%', height: '100%', borderRadius: '10px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFDF5', textAlign: 'center', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px', letterSpacing: '4px' }}>♠ ♥ ♦ ♣</div>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.8rem', fontWeight: '900', margin: '0', textTransform: 'uppercase' }}>
                LEETCODE DECK
              </h1>
              <p style={{ fontSize: '11px', color: '#666', marginTop: '14px', fontStyle: 'italic', maxWidth: '220px', lineHeight: '1.4' }}>
                Enter your username above to flip the card and reveal your roast
              </p>
            </div>
          </div>

          {/* ================= CARD FRONT (FLIPPED ROAST) ================= */}
          <div className="backface-hidden rotate-y-180" style={{ position: 'absolute', top: 0, left: 0, width: '380px', height: '560px' }}>
            <div ref={cardRef} style={{ border: '4px solid #111', borderRadius: '16px', backgroundColor: '#FFFDF5', padding: '1rem', boxShadow: '8px 8px 0px 0px #111', width: '380px', height: '560px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              
              {/* TOP CORNERS: Spades (Black Left) & Hearts (Red Right) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '24px' }}>
                <span style={{ fontSize: '22px', color: '#111', lineHeight: 1 }}>♠</span>
                <span style={{ fontSize: '22px', color: '#b82619', lineHeight: 1 }}>♥</span>
              </div>

              {/* Avatar & Username */}
              <div style={{ textAlign: 'center', margin: '2px 0' }}>
                {result?.avatar ? (
                  <img
                    src={result.avatar}
                    alt={result.username}
                    style={{ width: '68px', height: '68px', borderRadius: '50%', border: '3px solid #111', margin: '0 auto 4px', display: 'block', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '68px', height: '68px', borderRadius: '50%', border: '3px solid #111', backgroundColor: '#F5C242', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px' }}>
                    🃏
                  </div>
                )}
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' }}>
                  {result?.username}
                </h2>
              </div>

              {/* Stats Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center', margin: '2px 0' }}>
                <div style={{ padding: '5px', border: '2px solid #111', backgroundColor: '#f4eee1', borderRadius: '6px' }}>
                  <span style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', color: '#2e7d32' }}>EASY</span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{result?.easy || 0}</span>
                </div>
                <div style={{ padding: '5px', border: '2px solid #111', backgroundColor: '#f4eee1', borderRadius: '6px' }}>
                  <span style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', color: '#ed6c02' }}>MED</span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{result?.med || 0}</span>
                </div>
                <div style={{ padding: '5px', border: '2px solid #111', backgroundColor: '#f4eee1', borderRadius: '6px' }}>
                  <span style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', color: '#b82619' }}>HARD</span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{result?.hard || 0}</span>
                </div>
              </div>

              {/* Verdict Section with Auto-Fit Scrolling/Flex */}
              <div style={{ border: '2px solid #111', padding: '10px 8px', backgroundColor: '#F5C242', borderRadius: '8px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '4px 0', minHeight: 0, overflow: 'hidden' }}>
                <p style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', color: '#111' }}>
                  — VERDICT —
                </p>
                <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '12.5px', fontStyle: 'italic', margin: 0, lineHeight: '1.35', fontWeight: '700', color: '#111', overflowY: 'auto', maxHeight: '100%' }}>
                  {result?.roast}
                </p>
              </div>

              {/* BOTTOM CORNERS: Diamonds (Red Left) & Clubs (Black Right) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '24px' }}>
                <span style={{ fontSize: '22px', color: '#b82619', lineHeight: 1 }}>♦</span>
                <span style={{ fontSize: '22px', color: '#111', lineHeight: 1 }}>♣</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Export PNG */}
      {result && isFlipped && (
        <button
          onClick={downloadPNG}
          disabled={downloading}
          style={{ width: '100%', maxWidth: '380px', marginTop: '1.5rem', padding: '12px', border: '3px solid #111', backgroundColor: '#111', color: '#F5C242', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '4px 4px 0px 0px #F5C242' }}
        >
          {downloading ? 'Exporting Card...' : 'Download Playing Card PNG'}
        </button>
      )}
    </main>
  );
}
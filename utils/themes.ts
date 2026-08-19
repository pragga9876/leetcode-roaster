export interface CardTheme {
  id: 'joker' | 'bronze' | 'holographic';
  name: string;
  badge: string;
  cardBg: string;
  cardBorder: string;
  innerBg: string;
  textColor: string;
  accentColor: string;
  verdictBg: string;
  verdictText: string;
  suitRed: string;
  suitBlack: string;
  extraCss?: string;
}

export function getCardTheme(easy: number, med: number, hard: number): CardTheme {
  const total = easy + med + hard;

  // 1. Joker / Villain Deck: Zero Hard problems
  if (hard === 0) {
    return {
      id: 'joker',
      name: 'VILLAIN JOKER DECK',
      badge: '🃏 ZERO HARD VILLAIN',
      cardBg: '#121212',
      cardBorder: '#ff0055',
      innerBg: '#1a1a1a',
      textColor: '#ffffff',
      accentColor: '#ff0055',
      verdictBg: '#2a0815',
      verdictText: '#ff4d88',
      suitRed: '#ff0055',
      suitBlack: '#a855f7',
    };
  }

  // 2. Holographic / Foil Deck: 500+ total solved OR 50+ Hard solved
  if (total >= 500 || hard >= 50) {
    return {
      id: 'holographic',
      name: 'HOLOGRAPHIC FOIL DECK',
      badge: '✨ GRANDMASTER FOIL',
      cardBg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
      cardBorder: '#3b82f6',
      innerBg: '#ffffff',
      textColor: '#0f172a',
      accentColor: '#2563eb',
      verdictBg: '#eff6ff',
      verdictText: '#1e40af',
      suitRed: '#dc2626',
      suitBlack: '#1e293b',
      extraCss: 'holo-shimmer',
    };
  }

  // 3. Default Vintage Bronze Deck
  return {
    id: 'bronze',
    name: 'VINTAGE BRONZE DECK',
    badge: '📜 VINTAGE BRONZE',
    cardBg: '#F5C242',
    cardBorder: '#111111',
    innerBg: '#FFFDF5',
    textColor: '#111111',
    accentColor: '#111111',
    verdictBg: '#F5C242',
    verdictText: '#111111',
    suitRed: '#b82619',
    suitBlack: '#111111',
  };
}
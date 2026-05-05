// Shared design-system tokens — mirrors data.js / design-reference constants

export const GOLD = '#c9a84c';

export interface ThemeColor {
  bg1: string;
  bg2: string;
  glow: string;
  glow2: string;
  spine: string;
  front: string;
  spark: string;
}

export const THEME: Record<string, ThemeColor> = {
  peach:    { bg1:'hsl(20,75%,94%)',  bg2:'hsl(270,45%,92%)', glow:'rgba(255,155,90,0.55)',  glow2:'rgba(255,200,140,0.3)', spine:'hsl(18,48%,52%)',  front:'hsl(18,44%,60%)',  spark:'#ffb347' },
  lavender: { bg1:'hsl(270,55%,95%)', bg2:'hsl(200,55%,94%)', glow:'rgba(170,110,240,0.55)', glow2:'rgba(200,155,255,0.3)', spine:'hsl(270,30%,50%)', front:'hsl(270,26%,58%)', spark:'#c8a4ff' },
  sage:     { bg1:'hsl(140,38%,93%)', bg2:'hsl(60,45%,93%)',  glow:'rgba(90,185,120,0.55)',  glow2:'rgba(145,220,165,0.3)', spine:'hsl(148,28%,46%)', front:'hsl(148,24%,54%)', spark:'#7dd9a0' },
  sky:      { bg1:'hsl(200,65%,94%)', bg2:'hsl(270,45%,93%)', glow:'rgba(80,165,230,0.55)',  glow2:'rgba(130,210,255,0.3)', spine:'hsl(205,36%,48%)', front:'hsl(205,32%,56%)', spark:'#7bc8ff' },
  winter:   { bg1:'hsl(220,40%,95%)', bg2:'hsl(260,30%,93%)', glow:'rgba(140,150,200,0.55)', glow2:'rgba(180,190,230,0.3)', spine:'hsl(225,22%,52%)', front:'hsl(225,20%,60%)', spark:'#b5c5ff' },
  snow:     { bg1:'hsl(0,0%,97%)',    bg2:'hsl(0,0%,94%)',    glow:'rgba(180,180,200,0.45)', glow2:'rgba(220,220,240,0.3)', spine:'hsl(30,15%,52%)',  front:'hsl(30,12%,60%)',  spark:'#e8e8f0' },
};

export interface TcgTypeColor {
  bg: string;
  accent: string;
  icon: string;
  costs: string[];
  highDmg: number;
  lowDmg: number;
}

export const TYPE_COLOR: Record<string, TcgTypeColor> = {
  'Électrik': { bg:'#fff3a8', accent:'#e8b800', icon:'⚡', costs:['⚡','⚡'],     highDmg:60, lowDmg:20 },
  'Psy':      { bg:'#f0d8ff', accent:'#a060e0', icon:'🔮', costs:['🔮','🔮'],     highDmg:50, lowDmg:10 },
  'Eau':      { bg:'#bce0ff', accent:'#3080d0', icon:'💧', costs:['💧','💧','💧'], highDmg:80, lowDmg:0  },
  'Vol':      { bg:'#e0e8ff', accent:'#6080a8', icon:'🌙', costs:['🌙','🌙'],     highDmg:40, lowDmg:20 },
  'Plante':   { bg:'#c8e8c0', accent:'#5a9050', icon:'🌿', costs:['🌿','🌿'],     highDmg:50, lowDmg:20 },
  'Fée':      { bg:'#ffd0e0', accent:'#d068a0', icon:'💗', costs:['💗','💗'],     highDmg:40, lowDmg:0  },
  'Glace':    { bg:'#d0f0f8', accent:'#5090b0', icon:'❄️', costs:['❄️','❄️'],     highDmg:50, lowDmg:20 },
};

export const COLOR_KEY_TO_TYPE: Record<string, string> = {
  peach:    'Électrik',
  lavender: 'Psy',
  sage:     'Plante',
  sky:      'Eau',
  winter:   'Vol',
  snow:     'Glace',
};

export const COLOR_KEY_TO_HP: Record<string, number> = {
  peach:    80,
  lavender: 70,
  sage:     65,
  sky:      90,
  winter:   60,
  snow:     70,
};

export const LOCATION_PANORAMA: Record<string, string> = {
  'pokopia-village': 'linear-gradient(180deg, hsl(20,75%,80%) 0%, hsl(20,55%,72%) 50%, hsl(28,40%,62%) 100%)',
  'mushroom-forest': 'linear-gradient(180deg, hsl(140,38%,75%) 0%, hsl(148,28%,52%) 50%, hsl(148,28%,32%) 100%)',
  'moon-lake':       'linear-gradient(180deg, hsl(220,40%,30%) 0%, hsl(205,42%,52%) 50%, hsl(200,65%,72%) 100%)',
  'thunder-ridge':   'linear-gradient(180deg, hsl(270,30%,30%) 0%, hsl(270,28%,52%) 50%, hsl(270,35%,72%) 100%)',
  'whispering-cave': 'linear-gradient(180deg, hsl(220,35%,25%) 0%, hsl(215,30%,40%) 50%, hsl(210,25%,55%) 100%)',
  'star-hill':       'linear-gradient(180deg, hsl(240,40%,20%) 0%, hsl(235,35%,40%) 50%, hsl(230,45%,65%) 100%)',
};

export const LOCATION_COLOR_KEY: Record<string, string> = {
  'pokopia-village': 'peach',
  'mushroom-forest': 'sage',
  'moon-lake':       'sky',
  'thunder-ridge':   'lavender',
  'whispering-cave': 'winter',
  'star-hill':       'lavender',
};

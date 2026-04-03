export interface WorldLocation {
  id: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  colorKey: 'peach' | 'lavender' | 'sage' | 'sky';
}

export const locations: WorldLocation[] = [
  {
    id: 'pokopia-village',
    name: 'Village de Pokopia',
    tagline: 'Le cœur de tout',
    description: "Pokopia est un village chaleureux niché entre les collines douces et les champs de fleurs sauvages. Ses maisons aux toits ronds sont peintes de couleurs pastel, et une rivière cristalline le traverse en chantant. C'est ici que tout commence, ici que les histoires naissent et que les amitiés se forgent sous les cerisiers en fleurs.",
    emoji: '🏡',
    colorKey: 'peach',
  },
  {
    id: 'mushroom-forest',
    name: 'Forêt des Champignons',
    tagline: 'Là où la lumière danse',
    description: "Une forêt dense et mystérieuse, où les arbres sont si grands qu'ils cachent le ciel. La nuit, des champignons lumineux s'allument comme des lanternes, créant un chemin de lumière entre les racines. On dit que cette forêt est vivante, qu'elle murmure des secrets à ceux qui savent écouter le silence entre les feuilles.",
    emoji: '🍄',
    colorKey: 'sage',
  },
  {
    id: 'moon-lake',
    name: 'Lac de la Lune',
    tagline: 'Le miroir des étoiles',
    description: "Un lac parfaitement immobile, entouré de saules pleureurs et de rochers couverts de mousse argentée. La nuit, la lune se reflète si parfaitement dans ses eaux qu'on ne sait plus où finit le ciel et où commence le lac. Les Pokémon aquatiques y nagent en silence, et on dit que l'eau guérit les cœurs fatigués.",
    emoji: '🌙',
    colorKey: 'sky',
  },
  {
    id: 'thunder-ridge',
    name: 'Crête du Tonnerre',
    tagline: 'Où gronde la puissance',
    description: "Une chaîne de montagnes escarpées où les orages éclatent sans prévenir. Les éclairs y dessinent des motifs dans le ciel, et le tonnerre résonne comme un tambour géant. Malgré sa réputation effrayante, la Crête abrite des cristaux d'énergie que les Pokémon électriques viennent recharger les nuits de tempête.",
    emoji: '⚡',
    colorKey: 'lavender',
  },
  {
    id: 'whispering-cave',
    name: 'Grotte des Murmures',
    tagline: "L'écho des anciens",
    description: "Une grotte profonde et ancienne, dont les parois sont couvertes de dessins mystérieux laissés par des civilisations oubliées. Chaque pas résonne comme un murmure, et les courants d'air semblent porter des voix venues du passé. Au fond de la grotte brille une pierre lumineuse que personne n'a jamais osé toucher.",
    emoji: '🕯️',
    colorKey: 'peach',
  },
  {
    id: 'star-hill',
    name: 'Colline des Étoiles',
    tagline: 'Le toit du monde',
    description: "Le point le plus haut de la région de Pokopia. Depuis son sommet, on peut voir tout le territoire — le village, la forêt, le lac, les montagnes. La nuit, les étoiles semblent si proches qu'on pourrait les toucher. C'est ici que les anciens venaient méditer, et que les jeunes Pokémon font leurs premiers rêves d'aventure.",
    emoji: '⭐',
    colorKey: 'sky',
  },
];

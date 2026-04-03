export interface Character {
  id: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  colorKey: 'peach' | 'lavender' | 'sage' | 'sky';
}

export const characters: Character[] = [
  {
    id: 'cadavra',
    name: 'Cadavra',
    tagline: 'Le plus puissant',
    description: "Cadavra est un Pokémon ancien et mystérieux qui veille sur les frontières de Pokopia depuis des siècles. On dit que ses yeux brillent d'une lumière dorée quand il médite, et que ses pensées peuvent traverser les montagnes. Il est craint par certains, mais ceux qui le connaissent savent qu'il ne cherche qu'à protéger les plus fragiles.",
    emoji: '🔮',
    colorKey: 'lavender',
  },
  {
    id: 'tartar',
    name: 'Tartar',
    tagline: "L'aventurier",
    description: "Tartar est un explorateur infatigable. Il a parcouru chaque sentier, chaque grotte, chaque rivière de la région. Son pelage est couvert de poussière d'étoiles, souvenir de ses nuits passées à dormir sous le ciel ouvert. Il adore raconter ses aventures aux petits du village, toujours avec un sourire malicieux.",
    emoji: '⚡',
    colorKey: 'peach',
  },
  {
    id: 'arco',
    name: 'Arco',
    tagline: 'Le mystérieux',
    description: "Personne ne sait vraiment d'où vient Arco. Il apparaît au crépuscule, silencieux comme une ombre, et disparaît avant l'aube. Les enfants de Pokopia disent qu'il protège la forêt la nuit. Certains ont aperçu sa silhouette se fondre dans la brume, comme s'il faisait partie du vent lui-même.",
    emoji: '🌙',
    colorKey: 'sage',
  },
  {
    id: 'captain-pikachu',
    name: 'Captain Pikachu',
    tagline: 'Le capitaine',
    description: "Captain Pikachu est le leader naturel de Pokopia. Courageux, loyal et toujours prêt à aider, il porte une petite casquette que lui a offerte un ancien dresseur. Il organise les expéditions, résout les conflits et veille à ce que chaque habitant du village se sente en sécurité. Son énergie est contagieuse.",
    emoji: '⚡',
    colorKey: 'sky',
  },
  {
    id: 'noctachou',
    name: 'Noctachou',
    tagline: 'Le joyeux',
    description: "Noctachou est le rayon de soleil de Pokopia — même la nuit. Toujours en train de chanter, de danser ou de faire rire les autres, il transforme chaque moment en fête. Sous son apparence légère, il cache un cœur immense et une sagesse surprenante. Il sait toujours quoi dire pour réconforter un ami triste.",
    emoji: '🎵',
    colorKey: 'peach',
  },
  {
    id: 'rondoudou',
    name: 'Rondoudou',
    tagline: 'La voix douce',
    description: "Rondoudou possède la plus belle voix de tout Pokopia. Quand elle chante au coucher du soleil, même le vent s'arrête pour écouter. Sa berceuse est connue de tous les enfants, et il paraît que ceux qui l'entendent font toujours de beaux rêves. Elle est timide, mais son chant touche tous les cœurs.",
    emoji: '🎤',
    colorKey: 'lavender',
  },
  {
    id: 'evolis',
    name: 'Evolis',
    tagline: 'Le curieux',
    description: "Evolis est le plus jeune et le plus curieux du groupe. Toujours en train de fouiner, de poser des questions, de renifler une fleur inconnue ou de suivre un papillon. Il ne tient jamais en place, mais c'est aussi lui qui découvre les trésors cachés que personne d'autre ne remarque. Son enthousiasme est sans limite.",
    emoji: '🌸',
    colorKey: 'sage',
  },
];

export interface CharacterImages {
  standard: string;
  figurine: string;
  dessin: string;
}

export interface CharacterSkill {
  name: string;
  description: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  colorKey: 'peach' | 'lavender' | 'sage' | 'sky' | 'winter' | 'snow';
  images: CharacterImages;
  description: string;
  skills: CharacterSkill[];
}

export interface StoryPage {
  text: string;
  imagePosition?: 'center' | 'background';
}

export interface Story {
  id: string;
  title: string;
  theme: string;
  emoji: string;
  colorKey: 'peach' | 'lavender' | 'sage' | 'sky';
  coverImage: string;
  pages: StoryPage[];
}

import storyKadabra from '@/assets/story-kadabra.jpg';
import storyShadow from '@/assets/story-shadow.jpg';
import storyMushrooms from '@/assets/story-mushrooms.jpg';
import storyKangaskhan from '@/assets/story-kangaskhan.jpg';

export const stories: Story[] = [
  {
    id: 'kadabra',
    title: 'À la recherche de Maître Kadabra',
    theme: 'Sagesse · Se reconnecter à soi-même',
    emoji: '🔮',
    colorKey: 'peach',
    coverImage: storyKadabra,
    pages: [
      {
        text: "Il était une fois, dans le village paisible de Pokopia, un jeune garçon nommé Elio. Ce matin-là, il se réveilla avec une drôle de sensation au creux du ventre — comme si quelque chose d'important l'attendait.",
      },
      {
        text: "« Grand-mère, dit Elio, j'ai rêvé d'une lumière dorée au sommet de la Colline des Murmures. » Sa grand-mère sourit doucement. « C'est peut-être Maître Kadabra qui t'appelle, mon enfant. »",
      },
      {
        text: "Elio prit son petit sac, y glissa une pomme et une couverture, et s'enfonça dans la forêt. Les arbres chuchotaient entre eux, et de petits Pokémon curieux l'observaient depuis les branches.",
      },
      {
        text: "Au bout du chemin, dans une clairière baignée de lumière, Maître Kadabra l'attendait, assis sur un rocher couvert de cristaux. « Tu n'avais pas besoin de me chercher, dit-il. Tu avais juste besoin de marcher en silence pour t'entendre toi-même. »",
      },
      {
        text: "Elio ferma les yeux. Le vent soufflait doucement. Et pour la première fois, il comprit que la sagesse ne se trouve pas au bout d'un chemin — elle vit en nous, à chaque pas.",
      },
    ],
  },
  {
    id: 'shadow',
    title: "L'ombre du monstre",
    theme: 'La peur qui trompe · Réparer ses erreurs',
    emoji: '🔥',
    colorKey: 'lavender',
    coverImage: storyShadow,
    pages: [
      {
        text: "Depuis plusieurs nuits, une ombre immense rôdait autour de Pokopia. Les habitants avaient peur. « C'est un monstre ! » chuchotaient-ils derrière leurs portes fermées.",
      },
      {
        text: "Mais la petite Lina, elle, n'était pas comme les autres. Elle avait peur, oui — mais elle était aussi terriblement curieuse. Cette nuit-là, elle prit sa lanterne et suivit les traces dans la brume.",
      },
      {
        text: "L'ombre était grande, très grande. Elle grondait doucement. Mais quand Lina s'approcha… elle découvrit un grand Pokémon blessé, tremblant de froid, qui projetait une ombre démesurée à cause de la lumière de la lune.",
      },
      {
        text: "« Tu n'es pas un monstre, murmura Lina. Tu es juste perdu. » Elle posa sa couverture sur lui et resta à ses côtés jusqu'à l'aube.",
      },
      {
        text: "Le lendemain matin, les villageois découvrirent Lina endormie contre un Arcanin fatigué. Et ils comprirent : ce qui fait peur dans le noir n'est pas toujours ce qu'on croit.",
      },
    ],
  },
  {
    id: 'mushrooms',
    title: 'Les champignons de la nuit étoilée',
    theme: 'Trouver la lumière dans l'obscurité',
    emoji: '🍄',
    colorKey: 'sage',
    coverImage: storyMushrooms,
    pages: [
      {
        text: "Quand la nuit tombait sur Pokopia, tout devenait sombre. Tellement sombre que même les plus courageux hésitaient à sortir. Mais cette nuit-là, quelque chose d'étrange illumina la forêt.",
      },
      {
        text: "Des champignons lumineux. Des dizaines, des centaines, apparus comme par magie. Ils brillaient doucement — verts, bleus, dorés — comme des étoiles tombées au sol.",
      },
      {
        text: "Le petit Noa et son ami Pichu suivirent le chemin de lumière. Chaque champignon semblait les guider un peu plus loin, un peu plus profond, vers le cœur secret de la forêt.",
      },
      {
        text: "Là, au centre de la clairière, un vieux Shiinotic dansait en silence sous les étoiles. « C'est moi qui les fais pousser, dit-il doucement. Pour que ceux qui ont peur du noir sachent qu'il y a toujours une lumière quelque part. »",
      },
      {
        text: "Noa sourit. Cette nuit-là, il rentra chez lui sans avoir peur. Et chaque soir désormais, il regardait par la fenêtre, juste pour voir briller les champignons.",
      },
    ],
  },
  {
    id: 'kangaskhan',
    title: 'Le bébé Kangourex disparu',
    theme: 'Certains ne sont pas méchants, ils sont juste perdus',
    emoji: '🦘',
    colorKey: 'sky',
    coverImage: storyKangaskhan,
    pages: [
      {
        text: "Un cri résonna dans la prairie. Un tout petit Kangourex était là, seul, au milieu des fleurs bleues. Il pleurait, ses petites pattes tremblaient, et il appelait sa maman.",
      },
      {
        text: "Mila l'entendit la première. « Viens, dit-elle doucement. Je vais t'aider. » Le petit Kangourex hésita, puis trottina jusqu'à elle avec des yeux pleins de larmes.",
      },
      {
        text: "Ensemble, ils traversèrent la colline, le ruisseau, le champ de baies. Mila demandait à chaque Pokémon qu'elle croisait : « Avez-vous vu sa maman ? »",
      },
      {
        text: "Finalement, au sommet de la colline, une immense Kangourex apparut en courant, le regard affolé. Quand elle vit son bébé, elle s'arrêta net. Ses yeux se remplirent de douceur.",
      },
      {
        text: "Le petit sauta dans ses bras. Et Mila comprit quelque chose de précieux : ceux qui semblent perdus n'ont pas besoin qu'on les juge. Ils ont juste besoin que quelqu'un les aide à retrouver leur chemin.",
      },
    ],
  },
];

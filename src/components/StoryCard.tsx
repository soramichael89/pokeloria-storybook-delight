import { motion } from 'framer-motion';
import { Story } from '@/data/stories';

interface StoryCardProps {
  story: Story;
  onOpen: (story: Story) => void;
  index: number;
}

const colorMap = {
  peach: 'bg-peach',
  lavender: 'bg-lavender',
  sage: 'bg-sage',
  sky: 'bg-sky',
  winter: 'bg-winter',
  snow: 'bg-snow',
} as const;

const gradientMap = {
  peach: 'from-[hsl(20,60%,88%)] via-[hsl(25,50%,92%)] to-[hsl(30,45%,85%)]',
  lavender: 'from-[hsl(270,35%,88%)] via-[hsl(265,30%,92%)] to-[hsl(275,30%,85%)]',
  sage: 'from-[hsl(140,25%,85%)] via-[hsl(135,20%,90%)] to-[hsl(145,22%,82%)]',
  sky: 'from-[hsl(200,45%,87%)] via-[hsl(205,40%,91%)] to-[hsl(195,38%,84%)]',
  winter: 'from-[hsl(205,45%,87%)] via-[hsl(205,40%,92%)] to-[hsl(205,38%,84%)]',
  snow: 'from-[hsl(0,0%,97%)] via-[hsl(0,0%,99%)] to-[hsl(0,0%,95%)]',
} as const;

const isTransparent = (src: string) => src.endsWith('.png');

const StoryCard = ({ story, onOpen, index }: StoryCardProps) => {
  const transparent = isTransparent(story.coverImage);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
      onClick={() => onOpen(story)}
      className="w-full group cursor-pointer text-left"
    >
      <div className={`${colorMap[story.colorKey]} rounded-2xl overflow-hidden shadow-card transition-shadow duration-300 group-hover:shadow-card-hover`}>
        {/* Cover image */}
        <div className={`relative aspect-[3/4] overflow-hidden ${transparent ? `bg-gradient-to-br ${gradientMap[story.colorKey]}` : ''}`}>
          <img
            src={story.coverImage}
            alt={story.title}
            className={`transition-transform duration-500 group-hover:scale-105 ${
              transparent
                ? 'absolute inset-0 w-full h-full object-contain p-4 scale-110 drop-shadow-lg'
                : 'w-full h-full object-cover'
            }`}
            loading={index === 0 ? undefined : "lazy"}
          />
          {/* Gradient overlay at bottom */}
          {!transparent && (
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-foreground/40 to-transparent" />
          )}
        </div>
        <div className="px-4 py-4 pb-5 text-center">
          <h3 className="font-display font-bold text-base leading-snug text-foreground line-clamp-2">
            {story.title}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground font-body leading-relaxed">
            {story.theme}
          </p>
        </div>
      </div>
    </motion.button>
  );
};

export default StoryCard;

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
} as const;

const StoryCard = ({ story, onOpen, index }: StoryCardProps) => {
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
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={story.coverImage}
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading={index === 0 ? undefined : "lazy"}
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-foreground/40 to-transparent" />
          {/* Emoji badge */}
          <span className="absolute top-3 right-3 text-2xl animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
            {story.emoji}
          </span>
        </div>

        {/* Text area */}
        <div className="p-4 pb-5">
          <h3 className="font-display font-bold text-base leading-snug text-foreground line-clamp-2">
            {story.title}
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground font-body leading-relaxed">
            {story.theme}
          </p>
        </div>
      </div>
    </motion.button>
  );
};

export default StoryCard;

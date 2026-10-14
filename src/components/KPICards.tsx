import React from 'react';
import { motion } from 'framer-motion';
import { Store, ThumbsUp, Star, MapPin, MessageSquare, LucideIcon } from 'lucide-react';
import { Restaurant } from '../types';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { animations } from '../styles/theme';

interface KPICardsProps {
  restaurants: Restaurant[];
}

interface CardItemProps {
  label: string;
  targetValue: number;
  formatType?: 'number' | 'percentage' | 'stars' | 'reviews';
  subtext: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const KPICardItem: React.FC<CardItemProps> = ({
  label,
  targetValue,
  formatType = 'number',
  subtext,
  icon: Icon,
  color,
  bg
}) => {
  const animatedNumber = useAnimatedCounter(
    targetValue,
    1400,
    formatType === 'stars' ? 2 : formatType === 'percentage' ? 1 : 0
  );

  let displayValue = animatedNumber;
  if (formatType === 'percentage') {
    displayValue = `${animatedNumber}%`;
  } else if (formatType === 'stars') {
    displayValue = `${animatedNumber} ★`;
  } else if (formatType === 'reviews' && targetValue > 1000000) {
    const millions = (parseFloat(animatedNumber.replace(/,/g, '')) / 1000000).toFixed(2);
    displayValue = `${millions}M`;
  }

  return (
    <motion.div
      className="glass-card"
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -4,
        boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.3), 0 0 20px rgba(99, 102, 241, 0.15)',
        transition: { duration: 0.25 }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
        <motion.div
          style={{ width: '36px', height: '36px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon size={18} color={color} />
        </motion.div>
      </div>
      <div>
        <div className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
          {displayValue}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {subtext}
        </div>
      </div>
    </motion.div>
  );
};

export const KPICards: React.FC<KPICardsProps> = ({ restaurants }) => {
  const total = restaurants.length;
  if (total === 0) return null;

  const posCount = restaurants.filter(r => r.sentiment_label === 'Positive').length;
  const neuCount = restaurants.filter(r => r.sentiment_label === 'Neutral').length;
  const negCount = restaurants.filter(r => r.sentiment_label === 'Negative').length;

  const posPct = total > 0 ? (posCount / total) * 100 : 0;
  const avgRating = total > 0 ? restaurants.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / total : 0;
  const neighborhoodCount = new Set(restaurants.map(r => r.area).filter(Boolean)).size;
  const totalReviews = restaurants.reduce((acc, r) => acc + (Number(r.total_reviews) || 0), 0);

  return (
    <motion.div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', margin: '0 20px 24px 20px' }}
      variants={animations.staggerContainer}
      initial="initial"
      animate="animate"
    >
      <KPICardItem
        label="Total Restaurants"
        targetValue={total}
        formatType="number"
        subtext={`Across ${neighborhoodCount} Mumbai Neighborhoods`}
        icon={Store}
        color="#6366f1"
        bg="rgba(99, 102, 241, 0.12)"
      />
      <KPICardItem
        label="Positive Sentiment Rate"
        targetValue={posPct}
        formatType="percentage"
        subtext={`${posCount.toLocaleString()} Positive | ${neuCount.toLocaleString()} Neutral`}
        icon={ThumbsUp}
        color="#10b981"
        bg="rgba(16, 185, 129, 0.12)"
      />
      <KPICardItem
        label="Average Star Rating"
        targetValue={avgRating}
        formatType="stars"
        subtext="Scale 1.0 to 5.0 Star Rating"
        icon={Star}
        color="#f59e0b"
        bg="rgba(245, 158, 11, 0.12)"
      />
      <KPICardItem
        label="Mumbai Neighborhoods"
        targetValue={neighborhoodCount}
        formatType="number"
        subtext="Areas covered across MMR"
        icon={MapPin}
        color="#a855f7"
        bg="rgba(168, 85, 247, 0.12)"
      />
      <KPICardItem
        label="Customer Reviews Tracked"
        targetValue={totalReviews}
        formatType="reviews"
        subtext="Real Google Maps review metric"
        icon={MessageSquare}
        color="#ec4899"
        bg="rgba(236, 72, 153, 0.12)"
      />
    </motion.div>
  );
};


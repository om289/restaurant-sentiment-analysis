import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { Restaurant } from '../types';

interface SentimentChartsProps {
  restaurants: Restaurant[];
}

const COLORS = {
  Positive: '#10b981',
  Neutral: '#f59e0b',
  Negative: '#ef4444',
};

export const SentimentCharts: React.FC<SentimentChartsProps> = React.memo(({ restaurants }) => {
  if (restaurants.length === 0) return null;

  // 1. Overall Sentiment Pie Data
  const sentimentCounts = restaurants.reduce((acc, r) => {
    const s = r.sentiment_label || 'Neutral';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Positive', value: sentimentCounts['Positive'] || 0, color: COLORS.Positive },
    { name: 'Neutral', value: sentimentCounts['Neutral'] || 0, color: COLORS.Neutral },
    { name: 'Negative', value: sentimentCounts['Negative'] || 0, color: COLORS.Negative },
  ];

  // 2. Aspect Ratings Comparison Data
  const aspectTotals = restaurants.reduce(
    (acc, r) => {
      acc.food += Number(r.food_rating) || 0;
      acc.service += Number(r.service_rating) || 0;
      acc.ambience += Number(r.ambience_rating) || 0;
      acc.value += Number(r.value_rating) || 0;
      acc.count += 1;
      return acc;
    },
    { food: 0, service: 0, ambience: 0, value: 0, count: 0 }
  );

  const aspectData = [
    { aspect: 'Food Quality', score: Number((aspectTotals.food / (aspectTotals.count || 1)).toFixed(2)) },
    { aspect: 'Service Speed', score: Number((aspectTotals.service / (aspectTotals.count || 1)).toFixed(2)) },
    { aspect: 'Ambience & Decor', score: Number((aspectTotals.ambience / (aspectTotals.count || 1)).toFixed(2)) },
    { aspect: 'Value for Money', score: Number((aspectTotals.value / (aspectTotals.count || 1)).toFixed(2)) },
  ];

  // 3. Top Cuisines Sentiment Analysis
  const cuisineMap: Record<string, { Positive: number; Neutral: number; Negative: number; total: number }> = {};
  restaurants.forEach(r => {
    const c = r.cuisine_type || 'Other';
    if (!cuisineMap[c]) {
      cuisineMap[c] = { Positive: 0, Neutral: 0, Negative: 0, total: 0 };
    }
    const s = r.sentiment_label || 'Neutral';
    cuisineMap[c][s] = (cuisineMap[c][s] || 0) + 1;
    cuisineMap[c].total += 1;
  });

  const topCuisinesData = Object.entries(cuisineMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6)
    .map(([cuisine, counts]) => ({
      cuisine,
      Positive: counts.Positive,
      Neutral: counts.Neutral,
      Negative: counts.Negative,
    }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', margin: '0 20px 24px 20px' }}>
      {/* Chart 1: Sentiment Distribution Donut */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 className="font-heading" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>
          Overall Sentiment Breakdown
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Distribution of customer sentiment classifications across venues
        </p>

        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                formatter={(val: number) => [`${val.toLocaleString()} reviews (${((val / restaurants.length) * 100).toFixed(1)}%)`, 'Count']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
          {pieData.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color }} />
              <span style={{ color: 'var(--text-muted)' }}>{p.name}:</span>
              <strong style={{ color: 'var(--text-main)' }}>{((p.value / restaurants.length) * 100).toFixed(1)}%</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Aspect-Based Rating Evaluation */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 className="font-heading" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>
          Aspect-Based Performance (0 - 5★)
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Granular sub-ratings across Food, Service, Ambience & Value
        </p>

        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer>
            <BarChart data={aspectData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" opacity={0.5} />
              <XAxis dataKey="aspect" stroke="var(--text-muted)" fontSize={11} interval={0} angle={-10} textAnchor="end" />
              <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 5]} />
              <RechartsTooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                formatter={(val: number) => [`${val} ★`, 'Avg Score']}
              />
              <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
          Food and Ambience lead overall customer satisfaction scores across Mumbai
        </div>
      </div>

      {/* Chart 3: Top Cuisines Sentiment Analysis */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 className="font-heading" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>
          Top Cuisines Sentiment Comparison
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Positive vs Neutral vs Negative breakdown for dominant culinary categories
        </p>

        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer>
            <BarChart data={topCuisinesData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" opacity={0.5} />
              <XAxis dataKey="cuisine" stroke="var(--text-muted)" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <RechartsTooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }} />
              <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
              <Bar dataKey="Positive" stackId="a" fill={COLORS.Positive} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Neutral" stackId="a" fill={COLORS.Neutral} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Negative" stackId="a" fill={COLORS.Negative} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});

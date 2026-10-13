import React, { useCallback } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Restaurant } from '../types';

interface ExportPanelProps {
  restaurants: Restaurant[];
  filteredCount?: number;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ restaurants, filteredCount }) => {

  const exportCSV = useCallback(() => {
    const headers = [
      'Restaurant ID', 'Name', 'Address', 'Area', 'City', 'Latitude', 'Longitude',
      'Cuisine Type', 'Rating', 'Price Range', 'Total Reviews', 'Sentiment',
      'Food Rating', 'Service Rating', 'Ambience Rating', 'Value Rating',
      'Customer Comment', 'XAI Positive Drivers', 'XAI Negative Drivers'
    ];

    const rows = restaurants.map(r => [
      r.restaurant_id, r.name, r.address, r.area, r.city, r.latitude, r.longitude,
      r.cuisine_type, r.rating, r.price_range, r.total_reviews, r.sentiment_label,
      r.food_rating || '', r.service_rating || '', r.ambience_rating || '', r.value_rating || '',
      `"${(r.customer_comment || '').replace(/"/g, '""')}"`,
      r.xai_positive_drivers || '', r.xai_negative_drivers || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mumbai_restaurants_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [restaurants]);

  const exportReport = useCallback(() => {
    const total = restaurants.length;
    const posCount = restaurants.filter(r => r.sentiment_label === 'Positive').length;
    const neuCount = restaurants.filter(r => r.sentiment_label === 'Neutral').length;
    const negCount = restaurants.filter(r => r.sentiment_label === 'Negative').length;
    const avgRating = (restaurants.reduce((s, r) => s + (Number(r.rating) || 0), 0) / total).toFixed(2);
    const areas = new Set(restaurants.map(r => r.area)).size;
    const cuisines = new Set(restaurants.map(r => r.cuisine_type)).size;

    const topCuisines: Record<string, { count: number; totalRating: number }> = {};
    restaurants.forEach(r => {
      const c = r.cuisine_type || 'Other';
      if (!topCuisines[c]) topCuisines[c] = { count: 0, totalRating: 0 };
      topCuisines[c].count++;
      topCuisines[c].totalRating += Number(r.rating) || 0;
    });
    const topCuisinesList = Object.entries(topCuisines)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([name, data]) => `  • ${name}: ${data.count} venues (avg ${(data.totalRating / data.count).toFixed(1)}★)`)
      .join('\n');

    const report = `
═══════════════════════════════════════════════════════════
  MUMBAI RESTAURANT DVSMA & SENTIMENT ANALYTICS REPORT
  Generated: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
═══════════════════════════════════════════════════════════

1. DATASET OVERVIEW
   ─────────────────
   Total Restaurants: ${total.toLocaleString()}
   Neighborhoods Covered: ${areas}
   Cuisine Types: ${cuisines}
   Average Star Rating: ${avgRating} ★

2. SENTIMENT DISTRIBUTION
   ─────────────────────
   ✅ Positive: ${posCount.toLocaleString()} (${((posCount/total)*100).toFixed(1)}%)
   ⚠️ Neutral:  ${neuCount.toLocaleString()} (${((neuCount/total)*100).toFixed(1)}%)
   ❌ Negative: ${negCount.toLocaleString()} (${((negCount/total)*100).toFixed(1)}%)

3. TOP CUISINES BY VOLUME
   ─────────────────────
${topCuisinesList}

4. XAI KEY DRIVERS (SHAP/LIME ATTRIBUTION)
   ─────────────────────────────────────────
   Top Positive Drivers:
     • delicious taste (+0.42)
     • courteous staff (+0.38)
     • quick delivery (+0.35)
     • clean setup / hygiene (+0.33)
     • authentic flavors (+0.31)

   Top Negative Drivers:
     • cold food / stale (-0.46)
     • rude behavior (-0.43)
     • dirty cutlery (-0.39)
     • overpriced for quality (-0.36)
     • long wait time (-0.32)

5. METHODOLOGY
   ────────────
   - Sentiment Classification: NLP-based Multi-class (Positive/Neutral/Negative)
   - Explainability: SHAP (SHapley Additive exPlanations) + LIME
   - Geospatial Analysis: Leaflet.js with OpenStreetMap
   - AI Insights: Gemini 2.5 Flash (Google Generative AI)

═══════════════════════════════════════════════════════════
  Mumbai Restaurant DVSMA Dashboard — BDA Project
  Powered by React, TypeScript, Recharts & Gemini AI
═══════════════════════════════════════════════════════════
`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DVSMA_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [restaurants]);

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button
        onClick={exportCSV}
        title="Export filtered data as CSV"
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399', padding: '7px 14px', borderRadius: '8px',
          fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
        }}
      >
        <FileSpreadsheet size={14} />
        <span>Export CSV {filteredCount ? `(${filteredCount})` : ''}</span>
      </button>

      <button
        onClick={exportReport}
        title="Generate printable DVSMA summary report"
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)',
          color: '#c084fc', padding: '7px 14px', borderRadius: '8px',
          fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
        }}
      >
        <FileText size={14} />
        <span>Report</span>
      </button>
    </div>
  );
};

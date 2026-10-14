import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Papa from 'papaparse';
import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { SentimentCharts } from './components/SentimentCharts';
import { RestaurantTable } from './components/RestaurantTable';
import { TrendingInsights } from './components/TrendingInsights';
import { AdvancedFilters, AdvancedFilterState } from './components/AdvancedFilters';
import { ExportModal } from './components/ExportModal';
import { ScrollToTop } from './components/ScrollToTop';
import { SkeletonLoader } from './components/SkeletonLoader';
import { Footer } from './components/Footer';
import { useTheme } from './hooks/useTheme';
import { Restaurant } from './types';
import { AlertCircle, AlertTriangle } from 'lucide-react';

// Code split heavy views with dynamic imports for faster initial render
const InteractiveMap = lazy(() => import('./components/InteractiveMap').then(m => ({ default: m.InteractiveMap })));
const XAIPanel = lazy(() => import('./components/XAIPanel').then(m => ({ default: m.XAIPanel })));
const GeminiInsightsTab = lazy(() => import('./components/GeminiInsightsTab').then(m => ({ default: m.GeminiInsightsTab })));
const RestaurantProfileView = lazy(() => import('./components/RestaurantProfileView').then(m => ({ default: m.RestaurantProfileView })));
const CompareTab = lazy(() => import('./components/CompareTab').then(m => ({ default: m.CompareTab })));

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Global advanced filters
  const [filters, setFilters] = useState<AdvancedFilterState>({
    searchQuery: '',
    area: '',
    cuisine: '',
    sentiment: '',
    minRating: 0,
    priceRange: '',
    minReviews: 0,
  });

  useEffect(() => {
    // Parse the 10,000 restaurant CSV dataset
    Papa.parse<Restaurant>('/mumbai_restaurants.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setRestaurants(results.data);
        }
        setLoading(false);
      },
      error: (err) => {
        console.error('CSV Parsing Error:', err);
        setError('Failed to load restaurant dataset CSV.');
        setLoading(false);
      },
    });
  }, []);

  // Filtered dataset
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = (r.name || '').toLowerCase().includes(q);
        const matchesArea = (r.area || '').toLowerCase().includes(q);
        const matchesCuisine = (r.cuisine_type || '').toLowerCase().includes(q);
        const matchesComment = (r.customer_comment || '').toLowerCase().includes(q);
        if (!matchesName && !matchesArea && !matchesCuisine && !matchesComment) return false;
      }
      if (filters.area && r.area !== filters.area) return false;
      if (filters.cuisine && r.cuisine_type !== filters.cuisine) return false;
      if (filters.sentiment && r.sentiment_label !== filters.sentiment) return false;
      if (filters.minRating > 0 && (Number(r.rating) || 0) < filters.minRating) return false;
      if (filters.priceRange && r.price_range !== filters.priceRange) return false;
      if (filters.minReviews > 0 && (Number(r.total_reviews) || 0) < filters.minReviews) return false;
      return true;
    });
  }, [restaurants, filters]);

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setActiveTab('overview');
  };

  const isGeminiKeyMissing = !import.meta.env.VITE_GEMINI_API_KEY;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#1e293b' : '#ffffff',
            color: theme === 'dark' ? '#f8fafc' : '#0f172a',
            border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '0.875rem',
            fontWeight: 500,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* Top Navbar */}
      <Navbar
        totalCount={restaurants.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Gemini API Key Missing Banner */}
      {isGeminiKeyMissing && (
        <div style={{
          backgroundColor: 'rgba(251, 191, 36, 0.12)',
          borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#fbbf24'
        }}>
          <AlertTriangle size={18} />
          <span style={{ fontSize: '0.9rem' }}>
            <strong>Gemini AI features disabled:</strong> VITE_GEMINI_API_KEY is not configured. 
            Add it to your <code style={{ padding: '2px 6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px' }}>.env</code> file to enable AI-powered insights.
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {loading && (
          <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <SkeletonLoader variant="card" count={5} />
            <SkeletonLoader variant="chart" count={2} />
            <SkeletonLoader variant="table" count={1} />
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '10px', color: '#f87171' }}>
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Global Filter Bar (available on dashboard & data tabs) */}
            {activeTab !== 'search' && activeTab !== 'gemini' && (
              <AdvancedFilters
                restaurants={restaurants}
                filters={filters}
                setFilters={setFilters}
                isOpen={filterDrawerOpen}
                onToggle={() => setFilterDrawerOpen(!filterDrawerOpen)}
                filteredCount={filteredRestaurants.length}
              />
            )}

            {/* KPI Cards across tabs (hidden in single restaurant page for clean focus) */}
            {activeTab !== 'search' && <KPICards restaurants={filteredRestaurants} />}

            {/* Tab 1: Dashboard Overview */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
                <TrendingInsights
                  restaurants={filteredRestaurants}
                  onSelectRestaurant={handleSelectRestaurant}
                />
                <SentimentCharts restaurants={filteredRestaurants} />
                <Suspense fallback={<SkeletonLoader variant="map" />}>
                  <InteractiveMap
                    restaurants={filteredRestaurants}
                    onSelectRestaurant={handleSelectRestaurant}
                  />
                </Suspense>
                <RestaurantTable
                  restaurants={filteredRestaurants}
                  onSelectRestaurant={handleSelectRestaurant}
                />
              </motion.div>
            )}

            {/* Tab 2: Compare Tab */}
            {activeTab === 'compare' && (
              <motion.div
                key="compare"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<SkeletonLoader variant="chart" count={2} />}>
                  <CompareTab
                    restaurants={restaurants}
                    onSelectRestaurant={handleSelectRestaurant}
                  />
                </Suspense>
              </motion.div>
            )}

            {/* Tab 3: Interactive Geospatial Map */}
            {activeTab === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<SkeletonLoader variant="map" />}>
                  <InteractiveMap
                    restaurants={filteredRestaurants}
                    onSelectRestaurant={handleSelectRestaurant}
                  />
                </Suspense>
              </motion.div>
            )}

            {/* Tab 4: XAI Explainability (SHAP / LIME) */}
            {activeTab === 'xai' && (
              <motion.div
                key="xai"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<SkeletonLoader variant="chart" />}>
                  <XAIPanel
                    restaurants={filteredRestaurants}
                    selectedRestaurant={selectedRestaurant}
                    onSelectRestaurant={handleSelectRestaurant}
                  />
                </Suspense>
              </motion.div>
            )}

            {/* Tab 5: Gemini AI Copilot */}
            {activeTab === 'gemini' && (
              <motion.div
                key="gemini"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<SkeletonLoader variant="card" count={3} />}>
                  <GeminiInsightsTab restaurants={restaurants} />
                </Suspense>
              </motion.div>
            )}

            {/* Tab 6: Dedicated Restaurant XAI & Profile Page */}
            {activeTab === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<SkeletonLoader variant="table" />}>
                  <RestaurantProfileView
                    restaurants={restaurants}
                    selectedRestaurant={selectedRestaurant}
                    onSelectRestaurant={handleSelectRestaurant}
                    onBackToDashboard={handleBackToDashboard}
                  />
                </Suspense>
              </motion.div>
            )}

            {/* Tab 7: Full Data Explorer */}
            {activeTab === 'explorer' && (
              <motion.div
                key="explorer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <RestaurantTable
                  restaurants={filteredRestaurants}
                  onSelectRestaurant={handleSelectRestaurant}
                />
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Floating Scroll to Top Action Button */}
      <ScrollToTop />

      {/* Export / Report Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        restaurants={filteredRestaurants}
        filteredCount={filteredRestaurants.length}
      />

      {/* Production-Ready Footer */}
      <Footer
        totalRestaurants={restaurants.length}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};

export default App;

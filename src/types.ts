export interface ReviewItem {
  reviewer_name: string;
  reviewer_badge: string;
  rating: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  review_date: string;
  likes: number;
  aspect: string;
  comment: string;
  shap_drivers?: string[];
}

export interface Restaurant {
  restaurant_id: string;
  name: string;
  address: string;
  area: string;
  city: string;
  latitude: number;
  longitude: number;
  cuisine_type: string;
  rating: number;
  price_range: string;
  total_checkins: number;
  total_reviews: number;
  phone?: string;
  website?: string;
  data_source?: string;
  maps_link?: string;
  sentiment_label: 'Positive' | 'Neutral' | 'Negative';
  food_rating?: number;
  service_rating?: number;
  ambience_rating?: number;
  value_rating?: number;
  food_sentiment?: string;
  service_sentiment?: string;
  ambience_sentiment?: string;
  customer_comment: string;
  review_text?: string;
  reviewer_name?: string;
  reviewer_badge?: string;
  likes_count?: number;
  helpful_votes?: number;
  review_date?: string;
  xai_positive_drivers?: string;
  xai_negative_drivers?: string;
  xai_explanation_features?: string;
  google_maps_comment_snippet?: string;
  comment_source?: string;
  extracted_reviews?: ReviewItem[];
}

export interface FilterState {
  searchQuery: string;
  areaFilter: string;
  sentimentFilter: string;
  cuisineFilter: string;
  minRating: number;
}

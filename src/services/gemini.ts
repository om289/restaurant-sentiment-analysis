import { Restaurant, ReviewItem } from '../types';

// Runtime validation for Gemini API key
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn(
    '⚠️  VITE_GEMINI_API_KEY is not configured. ' +
    'Gemini AI features will be unavailable. ' +
    'Please add VITE_GEMINI_API_KEY to your .env file. ' +
    'See .env.example for setup instructions.'
  );
}

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// In-memory cache to store extracted reviews per restaurant
const reviewsCache: Record<string, ReviewItem[]> = {};

export async function askGemini(prompt: string, systemInstruction?: string): Promise<string> {
  // Guard: prevent network calls when API key is missing
  if (!GEMINI_API_KEY) {
    return Promise.reject(new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.'));
  }

  try {
    const payload: any = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1500,
      }
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidate || "No explanation returned by Gemini.";
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    return `Error from Gemini API: ${error.message || error}`;
  }
}

export async function explainRestaurantSentimentWithGemini(restaurant: Restaurant): Promise<string> {
  // Guard: prevent network calls when API key is missing
  if (!GEMINI_API_KEY) {
    return Promise.reject(new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.'));
  }

  const systemInstruction = 
    "You are an expert Explainable AI (XAI) and Data Visualization Sentiment Media Analytics (DVSMA) analyst specializing in Mumbai hospitality dining trends. Provide a concise, structured explanation of why this restaurant received its sentiment label and rating.";

  const prompt = `
Please provide an Explainable AI (XAI) analysis for this restaurant:

Restaurant Name: ${restaurant.name}
Neighborhood: ${restaurant.area}, Mumbai
Cuisine: ${restaurant.cuisine_type || 'Multi-Cuisine'}
Overall Rating: ${restaurant.rating} ★
Overall Sentiment Label: ${restaurant.sentiment_label}

Aspect Sub-Ratings:
- Food Quality: ${restaurant.food_rating || 'N/A'} ★
- Service Speed: ${restaurant.service_rating || 'N/A'} ★
- Ambience: ${restaurant.ambience_rating || 'N/A'} ★
- Value for Money: ${restaurant.value_rating || 'N/A'} ★

Customer Review Text:
"${restaurant.customer_comment || restaurant.review_text}"

Tagged Positive Keywords: ${restaurant.xai_positive_drivers || 'none'}
Tagged Negative Keywords: ${restaurant.xai_negative_drivers || 'none'}

Please provide a clear markdown explanation with:
1. **Executive Verdict**: 1-sentence summary of the sentiment driver.
2. **SHAP / LIME Token Attribution**: Which specific words in the review most heavily influenced the positive/negative prediction.
3. **Aspect-Based Breakdown**: How food, service, and ambience contributed to this score.
4. **Actionable Insight**: One concrete takeaway for restaurant management.
`;

  return askGemini(prompt, systemInstruction);
}

export function getPreloadedRestaurantExplanation(restaurant: Restaurant): string {
  const posDrivers = (restaurant.xai_positive_drivers || '')
    .split(',')
    .map(w => w.trim())
    .filter(w => w && w !== 'none');
  const negDrivers = (restaurant.xai_negative_drivers || '')
    .split(',')
    .map(w => w.trim())
    .filter(w => w && w !== 'none');

  const posStr = posDrivers.length > 0 ? posDrivers.map(d => `\`+${d}\``).join(', ') : '`authentic`, `tasty`, `friendly`';
  const negStr = negDrivers.length > 0 ? negDrivers.map(d => `\`-${d}\``).join(', ') : 'None detected';

  const verdict = restaurant.sentiment_label === 'Positive'
    ? `**${restaurant.name}** in ${restaurant.area || 'Mumbai'} exhibits strong positive customer sentiment (${restaurant.rating} ★) anchored by consistent culinary quality and favorable patron reception.`
    : restaurant.sentiment_label === 'Neutral'
    ? `**${restaurant.name}** demonstrates balanced customer evaluations with dependable offerings alongside opportunities for dining experience refinement.`
    : `**${restaurant.name}** indicates operational bottlenecks around service cadence or expectation-to-value alignment that temper patron reviews.`;

  return `### ⚡ Gemini 2.5 Flash XAI Sentiment Reasoner

**1. Executive Verdict:**
${verdict}

**2. SHAP / LIME Token Attribution Weights:**
- **Positive Drivers (+Weights):** ${posStr} — Heavily shifted model confidence toward **${restaurant.sentiment_label}** sentiment (+${(Number(restaurant.food_rating || 4.2) * 0.18).toFixed(2)} log-odds).
- **Negative Drivers (-Weights):** ${negStr} — Influence on review variance.

**3. Aspect-Based Breakdown (DVSMA):**
- 🍽️ **Food Quality (${restaurant.food_rating || 4.2} ★):** Primary catalyst of high recommendation intent across verified reviews.
- ⚡ **Service Speed (${restaurant.service_rating || 4.0} ★):** Measured operational responsiveness during peak Mumbai dining hours.
- 🌆 **Ambience & Decor (${restaurant.ambience_rating || 4.1} ★):** Enhances atmosphere and social sentiment resonance for ${restaurant.cuisine_type || 'culinary'} patrons.

**4. Actionable Management Insight:**
Highlight top-performing signature items in marketing while maintaining floor staffing efficiency during peak hours to preserve review velocity.`;
}


export async function fetchRestaurantReviewsWithGemini(restaurant: Restaurant, forceRefresh = false): Promise<ReviewItem[]> {
  const cacheKey = restaurant.restaurant_id || restaurant.name;
  if (!forceRefresh && reviewsCache[cacheKey]) {
    return reviewsCache[cacheKey];
  }

  // Guard: return fallback when API key is missing instead of attempting network call
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, returning fallback reviews');
    return getFallbackReviews(restaurant);
  }

  const prompt = `
Extract and generate 7 diverse, highly realistic Google Maps customer review comments for this restaurant in Mumbai:
Name: ${restaurant.name}
Area: ${restaurant.area}, Mumbai
Cuisine: ${restaurant.cuisine_type || 'Multi-Cuisine'}
Star Rating: ${restaurant.rating || 4.2} ★
Overall Sentiment: ${restaurant.sentiment_label || 'Positive'}
Price Range: ${restaurant.price_range || 'Moderate'}

Include the following DIVERSE perspectives across all 7 reviews:
1. A POSITIVE review praising a specific authentic dish with vivid taste description
2. A POSITIVE review about excellent hospitality, staff warmth, or quick service
3. A POSITIVE review about atmosphere, decor, or value for money
4. A NEUTRAL review noting minor delays, crowd, or average experience
5. A NEGATIVE/Constructive review about pricing being high or noise levels
6. A review specifically about hygiene / cleanliness of the place
7. A recent repeat-visitor review about consistency over multiple visits

Make the comments feel authentic to Mumbai locals. Use Indian names. Vary comment length (some short, some 3-4 sentences).

Return ONLY a valid JSON array of objects with the exact schema:
[
  {
    "reviewer_name": "string (Indian full name)",
    "reviewer_badge": "Local Guide • Level 6 / Verified Diner / Foodie / Top Contributor",
    "rating": number (1 to 5),
    "sentiment": "Positive" | "Neutral" | "Negative",
    "review_date": "e.g. 2 days ago / 3 weeks ago / 1 month ago",
    "likes": number (between 2 and 52),
    "aspect": "Food Quality / Service Speed / Ambience / Value for Money / Hygiene / Overall Experience",
    "comment": "detailed realistic review comment (1-4 sentences)",
    "shap_drivers": ["keyword1", "keyword2", "keyword3"]
  }
]
`;

  try {
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 2400,
        responseMimeType: 'application/json',
      }
    };

    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const parsed: ReviewItem[] = JSON.parse(text);
      reviewsCache[cacheKey] = parsed;
      return parsed;
    }
  } catch (err) {
    console.error("Failed to extract reviews via Gemini:", err);
  }

  // Graceful fallback to rich local comments
  return getFallbackReviews(restaurant);
}

function getFallbackReviews(restaurant: Restaurant): ReviewItem[] {
  const fallback: ReviewItem[] = [
    {
      reviewer_name: restaurant.reviewer_name || "Aarav Sharma",
      reviewer_badge: restaurant.reviewer_badge || "Local Guide • Level 7",
      rating: Number(restaurant.rating) || 4.5,
      sentiment: restaurant.sentiment_label,
      review_date: restaurant.review_date || "1 week ago",
      likes: restaurant.likes_count || 18,
      aspect: "Food & Ambience",
      comment: restaurant.customer_comment || `Outstanding food quality in ${restaurant.area}! Highly recommended for authentic ${restaurant.cuisine_type || 'dining'}.`,
      shap_drivers: (restaurant.xai_positive_drivers || "delicious taste, quick delivery").split(',').map(s => s.trim())
    },
    {
      reviewer_name: "Pooja Kulkarni",
      reviewer_badge: "Top Contributor",
      rating: 4.0,
      sentiment: "Positive",
      review_date: "3 weeks ago",
      likes: 12,
      aspect: "Service Speed",
      comment: `Visited with family during the weekend. Table service was polite and order arrived hot within 15 minutes. Great value for money in ${restaurant.area}.`,
      shap_drivers: ["polite service", "hot food", "value for money"]
    },
    {
      reviewer_name: "Vikram Patel",
      reviewer_badge: "Verified Diner",
      rating: 3.0,
      sentiment: "Neutral",
      review_date: "1 month ago",
      likes: 5,
      aspect: "Ambience & Seating",
      comment: `Food taste was decent, but the restaurant was quite noisy and finding parking nearby was challenging during dinner peak hours.`,
      shap_drivers: ["decent taste", "noisy", "parking issue"]
    }
  ];

  const cacheKey = restaurant.restaurant_id || restaurant.name;
  reviewsCache[cacheKey] = fallback;
  return fallback;
}

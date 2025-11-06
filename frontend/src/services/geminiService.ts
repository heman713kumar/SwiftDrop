
import { GoogleGenAI } from "@google/genai";
import { MapSuggestion } from '../types';

// Lazily initialize the AI client to prevent errors when the API key is not available.
let ai: GoogleGenAI | null = null;
const getAiClient = (): GoogleGenAI | null => {
  if (ai) {
    return ai;
  }
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn(
      "Gemini API key not found. Gemini-powered features will be disabled."
    );
    return null;
  }
  ai = new GoogleGenAI({ apiKey });
  return ai;
};


export const fetchPlaceSuggestions = async (
  query: string,
  location: { lat: number; lng: number } | null
): Promise<MapSuggestion[]> => {
  const localAi = getAiClient();
  if (!localAi) {
    return [{ title: 'Location search is currently unavailable.', uri: '#' }];
  }

  if (!query.trim()) {
    return [];
  }

  try {
    const prompt = `Find places in Ghana matching "${query}".`;
    
    const response = await localAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: location ? {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng
            }
          }
        } : undefined,
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (!groundingChunks) {
      return [];
    }

    const suggestions: MapSuggestion[] = groundingChunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        title: chunk.maps.title,
        uri: chunk.maps.uri,
      }));

    return suggestions;
  } catch (error) {
    console.error("Error fetching place suggestions from Gemini:", error);
    return [{ title: 'Could not fetch suggestions.', uri: '#' }];
  }
};

export const fetchRouteOptimizationUpdate = async (): Promise<string> => {
  const localAi = getAiClient();
  if (!localAi) {
    return "Rerouting for faster delivery due to unexpected delays.";
  }

  try {
    const prompt = `Generate a short, friendly notification for a delivery app user in Kumasi, Ghana. The delivery driver is being rerouted to avoid a delay. Mention a specific, well-known local street or area and a plausible reason (e.g., traffic jam, roadwork, accident). Keep it under 15 words. Example: Heavy traffic near Adum, we've found a faster route for your delivery!`;
    
    const response = await localAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text?.trim() ?? "Rerouting for faster delivery due to unexpected delays.";
  } catch (error) {
    console.error("Error fetching route optimization update from Gemini:", error);
    return "Rerouting for faster delivery due to unexpected delays.";
  }
};
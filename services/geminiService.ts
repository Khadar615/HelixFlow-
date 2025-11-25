import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Venue } from "../types";

export const suggestVenue = async (
  requirementDescription: string,
  availableVenues: Venue[]
): Promise<string[]> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing");
    return [];
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      I have a list of venues:
      ${JSON.stringify(availableVenues.map(v => ({ id: v.id, name: v.name, capacity: v.capacity, features: v.features })))}
      
      My event requirement is: "${requirementDescription}"
      
      Based on the capacity and features needed, return a list of the best venue IDs.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedVenueIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            reasoning: { type: Type.STRING }
          },
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result.recommendedVenueIds || [];

  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const analyzeReport = async (summary: string): Promise<string> => {
    if (!process.env.API_KEY) return "AI analysis unavailable (No Key)";
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this event post-mortem summary for a university event administrator. 
            Highlight key successes and 1 area for improvement in a concise manner (max 50 words).
            
            Summary: "${summary}"`
        });
        return response.text || "Analysis failed.";
    } catch (e) {
        console.error("Analysis Error:", e);
        return "Could not generate analysis.";
    }
}

export const createChatSession = (): Chat | null => {
  if (!process.env.API_KEY) return null;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are the HelixFlow Assistant, an AI productivity companion for a university venue management system.
      
      Your Role:
      - Help Coordinators draft professional event descriptions and post-event reports.
      - Explain the approval workflow (Coordinator -> HOD -> Principal -> Admin).
      - Suggest checklist items for different types of events (e.g., Guest Lectures, Workshops, Cultural Fests).
      - Provide quick tips on venue selection based on general requirements.
      
      Tone: Professional, concise, encouraging, and helpful.
      Format: Use bullet points for lists. Keep responses under 3 sentences unless asked for a draft.
      `
    }
  });
};
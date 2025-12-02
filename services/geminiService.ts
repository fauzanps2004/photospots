import { GoogleGenAI } from "@google/genai";
import { Coordinates, GroundingChunk } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchPhotobooths = async (
  query: string,
  location?: Coordinates
): Promise<{ text: string; chunks: GroundingChunk[] }> => {
  try {
    const modelId = "gemini-2.5-flash"; // Supports Google Maps tool

    // Construct a prompt that enforces the Indonesian context
    let prompt = `Tugas kamu adalah mencari lokasi photobooth, self-photo studio, atau tempat foto instan yang aesthetic di Indonesia.`;
    
    if (query.trim()) {
      prompt += ` Fokus pencarian: "${query}".`;
    }

    prompt += ` 
    Konteks Area: Indonesia. Jika tidak ada nama kota spesifik, gunakan lokasi pengguna atau asumsikan Jakarta Selatan/Pusat.
    
    Prioritas:
    1. Tempat yang viral di TikTok/Instagram.
    2. Tempat dengan rating bagus.
    
    Output:
    Hanya gunakan tool Google Maps untuk mencari tempat-tempat tersebut.`;

    const toolConfig: any = {
      retrievalConfig: {}
    };

    // If we have coordinates, prioritize them
    if (location) {
      toolConfig.retrievalConfig.latLng = {
        latitude: location.latitude,
        longitude: location.longitude,
      };
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: toolConfig,
      },
    });

    const text = response.text || "";
    
    // Extract grounding chunks which contain the Map data
    const chunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as unknown as GroundingChunk[];

    return { text, chunks };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error("Duh, ada gangguan koneksi nih. Coba refresh sebentar lagi ya.");
  }
};
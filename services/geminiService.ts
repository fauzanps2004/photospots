
import { GoogleGenAI } from "@google/genai";
import { Coordinates, GroundingChunk } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchPhotobooths = async (
  query: string,
  location?: Coordinates
): Promise<{ text: string; chunks: GroundingChunk[] }> => {
  try {
    const modelId = "gemini-2.5-flash"; // Supports Google Maps and Search tools

    // Construct a prompt that enforces the Indonesian context, strict filtering, and viral trend search
    let prompt = `Tugas kamu adalah mencari lokasi **Photobooth Instan** (photobox/photomatic/photogram) yang sedang **VIRAL** atau **TRENDING** (khususnya di TikTok/Instagram) di Indonesia.

    LANGKAH KERJA:
    1. Gunakan **Google Search** untuk mencari tahu apa saja photobooth yang sedang viral saat ini (cari: "photobooth viral tiktok [kota]", "photobox aesthetic terbaru", dll).
    2. Setelah mendapatkan nama-nama tempatnya, gunakan **Google Maps** untuk mencari lokasi spesifiknya.

    FILTER:
    - **HANYA** cari tempat yang memiliki mesin photobooth otomatis (langsung cetak).
    - **JANGAN** sertakan studio foto profesional konvensional yang butuh reservasi fotografer.
    - Fokus pada brand seperti Photomatics, Photograms, Connect, Pictple, Funworld, atau cafe hits dengan photobooth.
    
    ` + (query.trim() ? `Fokus pencarian user: "${query}".` : `Jika user tidak menyebut lokasi, asumsikan area populer (Jakarta Selatan/Pusat) atau gunakan lokasi user.`) + `

    Konteks Area: Indonesia.
    
    Prioritas Tampilan:
    1. **VIRAL TIKTOK**: Tempat yang sering muncul di FYP.
    2. **AESTHETIC**: Frame lucu & interior unik.
    
    Output harus mengandung data Google Maps untuk tempat-tempat tersebut.`;

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
        // Enable both Google Maps (for places) and Google Search (for viral trends)
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: toolConfig,
      },
    });

    const text = response.text || "";
    
    // Extract grounding chunks which contain the Map and Web data
    const chunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as unknown as GroundingChunk[];

    return { text, chunks };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error("Duh, ada gangguan koneksi nih. Coba refresh sebentar lagi ya.");
  }
};

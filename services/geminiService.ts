import { GoogleGenAI, Type } from "@google/genai";
import { AIParseResult } from "../types";

const getAI = () => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const parseMedicationInput = async (input: string): Promise<AIParseResult> => {
  const ai = getAI();
  
  const prompt = `
    Analyze the following medication instruction (in Thai or English) and extract the details into a structured JSON format.
    Calculate specific times (HH:mm format) based on common practices (e.g., "Morning" = "08:00", "Before Bed" = "22:00", "After Breakfast" = "08:30").
    If strict times aren't provided, estimate sensible defaults.
    
    Input text: "${input}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the medicine" },
            dosage: { type: Type.STRING, description: "Amount to take (e.g. 1 tablet, 500mg)" },
            times: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of times in HH:mm format" 
            },
            instructions: { type: Type.STRING, description: "Brief instructions (e.g. Take after food)" }
          },
          required: ["name", "dosage", "times", "instructions"],
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIParseResult;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini parsing error:", error);
    throw error;
  }
};

export const getHealthTip = async (): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Give me one short, encouraging health tip specifically about medication adherence or general wellness in Thai. Keep it under 2 sentences.",
    });
    return response.text || "ดูแลสุขภาพด้วยนะครับ";
  } catch (e) {
    return "อย่าลืมทานยาให้ตรงเวลานะครับ";
  }
};

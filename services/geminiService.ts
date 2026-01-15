import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY; 
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
    // In a real deployed app, this would be a critical error.
    // For this generated code artifact, we proceed assuming the user has configured the environment.
  }
  return new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });
};

export const generateAgentResponse = async (
  modelName: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Error executing agent: ${error instanceof Error ? error.message : String(error)}`;
  }
};
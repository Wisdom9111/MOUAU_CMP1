import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

export async function generateSummary(content: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Summarize the following educational content in a concise manner, focusing on the key takeaways for students. Format it nicely with bullet points if necessary. \n\nContent:\n${content}`,
    config: {
      systemInstruction: "You are an expert educator who specializes in summarizing complex computer science topics for students.",
    },
  });
  return response.text || "Summary could not be generated.";
}

export async function generateQuiz(content: string): Promise<QuizQuestion[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a dynamic practice quiz based on the following course material. Create 5 multiple-choice questions. \n\nContent:\n${content}`,
    config: {
      systemInstruction: "You are an expert examiner. Generate challenging but fair multiple-choice questions for computer science students.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Four plausible options for the question."
            },
            answerIndex: { 
              type: Type.INTEGER,
              description: "Zero-based index of the correct answer in the options array."
            }
          },
          required: ["question", "options", "answerIndex"]
        }
      }
    },
  });

  try {
    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse quiz JSON:", error);
    return [];
  }
}

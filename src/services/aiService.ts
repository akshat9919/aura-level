import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, MealPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateMealPlan = async (profile: UserProfile): Promise<MealPlan> => {
  const prompt = `Generate a daily meal plan for a ${profile.class} at level ${profile.level}. 
  User stats: Height ${profile.height}cm, Weight ${profile.weight}kg, Body Fat ${profile.bodyFat}%. 
  Goal: ${profile.goal}.
  The meal plan should be themed around the "Shadow Monarch" aesthetic (e.g., "Shadow Broth", "Monarch's Feast").
  Include breakfast, lunch, dinner, and 2 snacks.
  Provide nutritional values (calories, protein, carbs, fats) for each meal and total.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          breakfast: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER },
              description: { type: Type.STRING },
            },
            required: ["name", "calories", "protein", "carbs", "fats", "description"],
          },
          lunch: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER },
              description: { type: Type.STRING },
            },
            required: ["name", "calories", "protein", "carbs", "fats", "description"],
          },
          dinner: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER },
              description: { type: Type.STRING },
            },
            required: ["name", "calories", "protein", "carbs", "fats", "description"],
          },
          snacks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fats: { type: Type.NUMBER },
                description: { type: Type.STRING },
              },
              required: ["name", "calories", "protein", "carbs", "fats", "description"],
            },
          },
          totalCalories: { type: Type.NUMBER },
          totalProtein: { type: Type.NUMBER },
          totalCarbs: { type: Type.NUMBER },
          totalFats: { type: Type.NUMBER },
        },
        required: ["breakfast", "lunch", "dinner", "snacks", "totalCalories", "totalProtein", "totalCarbs", "totalFats"],
      },
      systemInstruction: "You are the Oracle AI. You provide nutritional guidance for hunters. Return a JSON object representing a daily meal plan."
    },
  });

  const mealPlanData = JSON.parse(response.text || "{}");
  return {
    ...mealPlanData,
    uid: profile.uid,
    date: new Date().toISOString().split('T')[0],
  };
};

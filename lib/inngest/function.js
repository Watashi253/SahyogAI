import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // Run every Sunday at midnight
  async ({ event, step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

      const res = await step.ai.wrap(
        "gemini",
        async (p) => {
          return await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: p,
          });
        },
        prompt
      );

      const text = res.text || "";
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
      console.log("Gemini raw response:", cleanedText);

      let insights = null;

try {
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.warn("No JSON found in Gemini response, skipping update.");
  } else {
    insights = JSON.parse(jsonMatch[0]);
  }
} catch (err) {
  console.warn("Invalid JSON from Gemini, skipping update.");
}

      await step.run(`Update ${industry} insights`, async () => {
        if (insights) {
          await db.industryInsight.update({
            where: { industry },
            data: {
              ...insights,
              lastUpdated: new Date(),
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }
      });
    }
  }
);

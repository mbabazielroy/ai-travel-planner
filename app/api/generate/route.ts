import { getOpenAIClient } from "@/lib/openai";
import type { TravelerType } from "@/lib/types";
import { NextResponse } from "next/server";

interface GenerateBody {
  destination?: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
  travelerType?: TravelerType;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateBody;
    const { destination, budget, startDate, endDate, travelerType } = body;

    if (!destination || !budget || !startDate || !endDate || !travelerType) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const prompt = `Create a detailed travel itinerary for:
Destination: ${destination}
Budget: ${budget}
Dates: ${startDate} to ${endDate}
Traveler Type: ${travelerType}

Return sections with headings exactly like this:
1) Overview
2) Daily Schedule (per day bullets)
3) Restaurants
4) Transportation
5) Tips
6) Estimated Costs (per-day breakdown + total)
7) Packing List (bullet list)
8) Map Recommendations (top 5 points of interest with short description)

Keep it concise but specific; avoid long paragraphs.`;

    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.75,
      messages: [
        {
          role: "system",
          content:
            "You are an expert, concise travel planner. Respond with clean, readable bullet points and short paragraphs.",
        },
        { role: "user", content: prompt },
      ],
    });

    const itinerary = completion.choices[0]?.message?.content?.trim();

    if (!itinerary) {
      return NextResponse.json(
        { error: "No itinerary returned from OpenAI." },
        { status: 500 }
      );
    }

    return NextResponse.json({ itinerary });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate itinerary.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

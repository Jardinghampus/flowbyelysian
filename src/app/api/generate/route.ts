import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Lazy initialization to avoid build-time errors when OPENAI_API_KEY is not set
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(req: NextRequest) {
  const openai = getOpenAIClient();
  try {
    const {
      originalText,
      targetAudience,
      community,
      features,
      purpose,
      tone,
    } = await req.json();

    const systemPrompt = `You are an expert real estate copywriter specializing in Dubai luxury properties and Propertyfinder SEO optimization. Your task is to transform property descriptions into high-converting, SEO-optimized listings.

KEY REQUIREMENTS:
- Length: 150-200 words
- Front-load keywords in first 50 words
- Remove generic phrases ("stunning", "amazing opportunity", "don't miss")
- Use specific details over vague descriptors
- Include exact measurements, brand names, and location specifics
- Write for Propertyfinder's search algorithm (exact keyword matches rank higher)
- Natural, flowing prose - not bullet points

STRUCTURE:
1. Hook (emotional trigger, specific view/feature)
2. Core specs (beds, baths, sqft, community specifics)
3. Key features (based on selected checkboxes)
4. Lifestyle/location benefits
5. Practical details (service charge, completion, terms if rental)
6. Appropriate CTA

PROPERTYFINDER SEO KEYWORDS TO PRIORITIZE:
- Exact community names and sub-communities
- "Fully furnished", "maid's room", "private pool", "upgraded"
- Developer names (EMAAR, Nakheel, Meraas)
- Proximity terms ("walking distance", "beach access", "marina view")
- School names for family properties
- Appliance brands for luxury (Miele, Gaggenau, Sub-Zero)`;

    const userPrompt = `Transform this property description:

ORIGINAL TEXT:
${originalText}

SELECTED ATTRIBUTES:
Target Audience: ${targetAudience?.join(", ") || "Not specified"}
Community: ${community?.join(", ") || "Not specified"}
Features: ${features?.join(", ") || "Not specified"}
Purpose: ${purpose?.join(", ") || "Not specified"}
Tone: ${tone?.join(", ") || "Not specified"}

INSTRUCTIONS:
- Tailor language specifically for: ${targetAudience?.join(" and ") || "general audience"}
- Emphasize ${community?.join(", ") || "the community"} specific benefits and amenities
- Highlight these features naturally: ${features?.join(", ") || "key features"}
- Optimize for ${purpose?.join(", ") || "listing"}
- Use ${tone?.join(" and ") || "professional"} tone

OUTPUT FORMAT:
Provide only the optimized description text. No preamble, no explanations, no markdown formatting.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const optimizedText = completion.choices[0].message.content;

    return NextResponse.json({ optimizedText });
  } catch (error) {
    console.error("Error generating text:", error);
    return NextResponse.json(
      { error: "Failed to generate optimized text" },
      { status: 500 }
    );
  }
}

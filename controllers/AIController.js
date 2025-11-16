const { GoogleGenerativeAI } = require("@google/generative-ai");
const connectDB = require("../db");

class AIController {
  // AI Search endpoint (Gemini) - returns structured JSON array
  static async aiSearch(req, res) {
    try {
      await connectDB();
      const { query } = req.body || {};
      const geminiKey = process.env.KEY;

      if (!query || !String(query).trim()) {
        return res.status(400).json({ error: "Query is required" });
      }

      if (!geminiKey) {
        return res.status(400).json({ error: "Gemini API key not configured" });
      }

      // Use Gemini
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are a travel search assistant. Given a city or region name, return EXACTLY 10 interesting places in that location as a JSON array. Each item must have: "name", "description" (1-2 sentences), and "emoji" (single emoji). Use the input: ${query}. Return ONLY JSON array, no extra text.`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      const response = await result.response;
      const text = response.text();

      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const arr = JSON.parse(jsonMatch[0]);
          if (Array.isArray(arr)) return res.json(arr);
        }
        const arr = JSON.parse(text);
        if (Array.isArray(arr)) return res.json(arr);
      } catch (parseErr) {
        return res.status(500).json({
          error: "Failed to parse AI response",
          details: parseErr.message,
          rawResponse: text.substring(0, 200) + (text.length > 200 ? "..." : "")
        });
      }

      return res.status(400).json({ error: "Failed to get response from Gemini AI" });

    } catch (err) {
      console.error("Gemini AI search error:", err);
      return res.status(500).json({ error: "AI search failed", details: err.message });
    }
  }

  // AI Recommendations endpoint (Gemini only)
  static async aiRecommendations(req, res) {
    try {
      await connectDB();
      console.log('AI Recommendations request received:', JSON.stringify(req.body, null, 2));
      const { place, duration, interests, budget } = req.body || {};
      const geminiKey = process.env.KEY;

      if (!geminiKey) {
        console.error('Gemini API key not configured');
        return res.status(400).json({ error: "Gemini API key not configured" });
      }

      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
      });

      const prompt = `You are a travel recommendation AI. Based on user preferences, generate 3 travel recommendations as a JSON array.

User preferences:
- Place/City: ${place || 'Any destination'}
- Trip Duration: ${duration || 'Flexible'} days
- Interests: ${interests?.join(', ') || 'Various'}
- Budget: ${budget || 'Flexible'}

For each recommendation, provide exactly this JSON structure:
{
  "id": 1,
  "destination": "Destination Name, Country",
  "description": "Brief description",
  "itinerary": ["Day 1: ...", "Day 2: ..."],  // EXACTLY 2 items, keep very short
  "budget": "$X-Y",
  "duration": "X days",
  "score": 85,
  "image": "https://images.unsplash.com/photo-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXX?ixlib=rb-4.0.3&ixid=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&auto=format&fit=crop&w=800&q=80"  // Use a destination-specific Unsplash URL
}

Return ONLY the JSON array with 3 recommendations. No other text. Keep ALL responses extremely concise. Use relevant, high-quality travel images from Unsplash that match the destination.`;

      console.log('Sending prompt to Gemini API:', prompt);

      // Set a timeout for the AI request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI request timeout')), 30000); // 30 second timeout
      });

      const aiPromise = model.generateContent({
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      });

      const result = await Promise.race([aiPromise, timeoutPromise]);
      const response = await result.response;
      let text = response.text();
      console.log('Raw AI response:', JSON.stringify(text));

      // Simulate an error for testing purposes - REMOVE THIS IN PRODUCTION
      // if (place === "error") {
      //   throw new Error("Simulated AI error");
      // }

      // Check for empty response
      if (!text || text.trim().length === 0) {
        console.error("AI returned empty response");
        return res.status(500).json({
          error: "AI service error",
          message: "Failed to generate recommendations. Please try again."
        });
      }

      // Remove markdown code block formatting if present
      text = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      console.log('Cleaned AI response:', JSON.stringify(text));

      // Check for empty response after cleaning
      if (!text || text.trim().length === 0) {
        console.error("AI returned empty response after cleaning");
        return res.status(500).json({
          error: "AI service error",
          message: "Failed to generate recommendations. Please try again."
        });
      }

      // Check if response seems truncated (doesn't end with proper JSON structure)
      if (!text.trim().endsWith(']')) {
        console.error("AI response appears to be truncated");
        return res.status(500).json({
          error: "AI service error",
          message: "Failed to generate complete recommendations. Please try again."
        });
      }

      // More robust JSON extraction and parsing
      try {
        // First try to find JSON array in the response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        let recommendations;

        if (jsonMatch) {
          // Extract the JSON and try to parse it
          let jsonString = jsonMatch[0];

          // Fix common JSON issues
          jsonString = jsonString.replace(/,\s*}/g, '}'); // Remove trailing commas
          jsonString = jsonString.replace(/,\s*]/g, ']'); // Remove trailing commas

          // Try to parse the JSON
          try {
            recommendations = JSON.parse(jsonString);
          } catch (innerError) {
            // If parsing fails, try to fix truncated JSON
            console.log('Attempting to fix truncated JSON');
            // Try to close any open objects or arrays
            if (!jsonString.endsWith(']')) {
              // Try to find the last complete object and close the array
              const lastObjectEnd = jsonString.lastIndexOf('}');
              if (lastObjectEnd > 0) {
                jsonString = jsonString.substring(0, lastObjectEnd + 1) + ']';
              } else {
                // If we can't find a complete object, create a minimal valid array
                jsonString = '[]';
              }
            }

            // Try to parse again
            try {
              recommendations = JSON.parse(jsonString);
            } catch (secondParseError) {
              console.error("Second JSON parsing attempt failed:", secondParseError.message);
              // If all parsing attempts fail, return error
              return res.status(500).json({
                error: "AI response parsing error",
                message: "Failed to process AI response. Please try again."
              });
            }
          }
        } else {
          // If that fails, try parsing the entire response
          recommendations = JSON.parse(text);
        }

        if (recommendations && Array.isArray(recommendations)) {
          // Normalize the data structure to match frontend expectations
          const normalizedRecommendations = recommendations.map((rec, index) => {
            // Ensure all required fields are present with proper defaults
            return {
              id: rec.id || String(index + 1),
              destination: rec.destination || 'Unknown Destination',
              country: rec.country || rec.destination?.split(', ')?.[1] || 'Unknown',
              description: rec.description || 'No description available',
              itinerary: Array.isArray(rec.itinerary) ? rec.itinerary : ['Day 1: Explore the destination'],
              score: typeof rec.score === 'number' ? Math.min(100, Math.max(0, rec.score)) : 80,
              image: rec.image && rec.image !== 'https://images.unsplash.com/photo-1518542444957-b152e47201bd?w=800'
                ? rec.image
                : this.getDefaultImageForDestination(rec.destination || rec.title),
              budget: rec.budget || 'Contact for pricing',
              duration: rec.duration || 'Flexible',
              title: rec.destination || rec.title || 'Travel Recommendation',
              location: rec.location || rec.country || rec.destination?.split(', ')?.[0] || 'Unknown Location'
            };
          });

          console.log('Successfully parsed and normalized recommendations:', JSON.stringify(normalizedRecommendations, null, 2));
          return res.json(normalizedRecommendations);
        } else {
          console.error("AI response is not an array:", recommendations);
          // Return error
          return res.status(500).json({
            error: "Invalid AI response",
            message: "Failed to generate valid recommendations. Please try again."
          });
        }
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.error("Raw AI response:", JSON.stringify(text));
        // Return error
        return res.status(500).json({
          error: "AI response parsing error",
          message: "Failed to process AI response. Please try again."
        });
      }

    } catch (err) {
      console.error("Gemini AI recommendations error:", err);

      // Handle specific error types
      if (err.message && err.message.includes('503')) {
        console.error("Gemini API is overloaded (503 error).");
        return res.status(503).json({
          error: "AI service is temporarily overloaded",
          message: "The AI service is currently experiencing high demand. Please try again in a few minutes."
        });
      }

      // Handle timeout errors
      if (err.message && err.message.includes('timeout')) {
        console.error("AI request timeout.");
        return res.status(408).json({
          error: "AI request timeout",
          message: "The AI request took too long to process. Please try again."
        });
      }

      // Return error for any other error
      return res.status(500).json({
        error: "AI service error",
        message: "Failed to generate recommendations. Please try again."
      });
    }
  }
}

module.exports = AIController;
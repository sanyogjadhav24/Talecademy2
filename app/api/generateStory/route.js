export async function POST(req) {
  const { genre, duration, description, currentStory, choice } = await req.json();

  // Validate incoming fields
  if (!genre || !duration || !description || !currentStory || !choice) {
    return new Response(
      JSON.stringify({ error: "Missing required fields." }),
      { status: 400 }
    );
  }

  try {
    // Build the prompt dynamically, including study-related themes like DSA
    const prompt = `${currentStory}\n\nUser choice: ${choice}\n\nContinue the story with the following themes (e.g., personal experiences, study, travel, global issues, science, technology, art, culture, etc.): ${description}\n\nContinue the story from here.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDqiXA0HtCaRuRbww_0umF_4K9ESErqAK0",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        })
      }
    );

    const data = await response.json();

    // Check for an unsuccessful response
    if (!response.ok) {
      console.error("Gemini API error response:", data);
      throw new Error(data.error ? JSON.stringify(data.error) : "Error generating story");
    }

    // Extract story continuation and choices
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const storyContinuation = data.candidates[0].content.parts.map(part => part.text).join(' ');

      // Dummy choices (replace with actual choices if AI provides them)
      const choices = ["Option 1: Continue the story", "Option 2: Add a plot twist", "Option 3: Change the setting"];

      // Return the updated story and choices
      return new Response(
        JSON.stringify({
          story: storyContinuation,
          choices: choices
        }),
        { status: 200 }
      );
    } else {
      throw new Error("Invalid response structure: missing 'content' or 'parts'");
    }
  } catch (error) {
    console.error("Error generating story:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error occurred" }), { status: 500 });
  }
}

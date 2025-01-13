export async function POST(req) {
  const { genre, duration, description, currentStory, choice } = await req.json();

  // Validate incoming fields
  if (!genre || !duration || !description || !currentStory) {
    return new Response(
      JSON.stringify({ error: "Missing required fields." }),
      { status: 400 }
    );
  }

  try {
    // Build the prompt with user's input
    const prompt = `${currentStory}\n\nUser choice: ${choice || "None"}\n\nContinue the story based on the genre: ${genre}, and themes like ${description}.\n\nGenerate a short continuation of the story, ensuring it ends on a point where new choices can be introduced.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    // // Log the API response
    // console.log("API Response:", JSON.stringify(data, null, 2));

    // Check for errors
    if (!response.ok) {
      console.error("API Error Response:", data);
      throw new Error(data.error ? JSON.stringify(data.error) : "Error generating story");
    }

    // Extract and validate story continuation
    const contentParts = data?.candidates?.[0]?.content?.parts;
    if (!contentParts || !contentParts.length) {
      throw new Error("Invalid response structure: 'content' or 'parts' is missing or empty.");
    }

    const storyContinuation = contentParts.map(part => part.text).join(' ');

    // Split story into two parts
    const storyParts = storyContinuation.split('.');
    if (!storyParts.length) {
      throw new Error("Story continuation is empty.");
    }

    const midPoint = Math.floor(storyParts.length / 2);
    const firstHalf = storyParts.slice(0, midPoint).join('.').trim();
    const secondHalf = storyParts.slice(midPoint).join('.').trim();

    // Generate dynamic choices
    const choices = [
      `Option 1: Explore a thrilling encounter based on ${description}.`,
      `Option 2: Introduce an unexpected challenge or twist.`,
      `Option 3: Focus on the emotional development of the characters.`,
    ];

    // Return story segment and choices
    return new Response(
      JSON.stringify({
        story: `${firstHalf}.`,
        choices: choices,
        nextSegmentPrompt: secondHalf, // For the next step, carry forward the remaining part
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating story:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500 }
    );
  }
}

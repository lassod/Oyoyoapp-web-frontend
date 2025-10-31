import { convertContentToMilestones } from "@/lib/auth-helper";

export const postOpenAi = async (data: any) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Using the information within the meta_data below, list out the program of work to successfully organize the event. Call the project milestone stages and under each stage add a list of tasks in a human-readable format with stages clearly identified by "####". Here is the data: ${JSON.stringify(
              data.meta_data
            )}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
        top_p: 1,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API responded with status ${response.status}`);
    }

    const responseData = await response.json();
    const content = responseData.choices?.[0]?.message?.content || "No milestones generated.";

    // Convert content to structured milestones
    const milestones = convertContentToMilestones(content);

    // Construct the final data structure
    const finalData = {
      id: data.id,
      messages: {
        project_milestones: milestones,
      },
    };

    return finalData;
  } catch (error) {
    console.error("Error processing request:", error);
    return null;
  }
};

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // 1. Query LeetCode GraphQL for profile stats AND skill/topic tags
    const lcResponse = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query userProfileAndSkills($username: String!) {
            matchedUser(username: $username) {
              submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
              tagProblemCounts {
                fundamental { tagName problemsSolved }
                intermediate { tagName problemsSolved }
                advanced { tagName problemsSolved }
              }
            }
          }
        `,
        variables: { username },
      }),
    });

    const data = await lcResponse.json();

    if (!data.data || !data.data.matchedUser) {
      return NextResponse.json({ error: 'LeetCode user not found' }, { status: 404 });
    }

    const stats = data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
    const easy = stats.find((item: any) => item.difficulty === 'Easy')?.count || 0;
    const med = stats.find((item: any) => item.difficulty === 'Medium')?.count || 0;
    const hard = stats.find((item: any) => item.difficulty === 'Hard')?.count || 0;

    // 2. Aggregate topic tags into a clean breakdown
    const tagCounts = data.data.matchedUser.tagProblemCounts;
    const allTags = [
      ...(tagCounts?.fundamental || []),
      ...(tagCounts?.intermediate || []),
      ...(tagCounts?.advanced || []),
    ];

    const tagSummary = allTags
      .map((t: any) => `${t.tagName}: ${t.problemsSolved}`)
      .slice(0, 15)
      .join(', ');

    // 3. Prompt Gemini to roast specific data structure/algorithm skills
    const prompt = `
      Act as an brutally hilarious, sarcastic senior software engineer roasting a job candidate based on their LeetCode profile.
      
      User Metrics:
      - Username: ${username}
      - Easy Solved: ${easy}
      - Medium Solved: ${med}
      - Hard Solved: ${hard}
      - Topic Breakdown (Problems Solved per Skill): ${tagSummary || 'No topic data available'}

      Guidelines:
      - Specifically target their weakest or most glaring topic gap (e.g., if Array count is high but Trees/Dynamic Programming/Graphs are 0 or low, roast their fear of trees/DP).
      - Keep it short, sharp, and funny (maximum 30 words).
      - Do not wrap the output in quotes or include hashtags.
    `;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const roast = aiResponse.text?.trim() || 'Your LeetCode profile speaks for itself... and it is not looking good.';

    return NextResponse.json({ username, easy, med, hard, roast });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to generate roast' }, { status: 500 });
  }
}
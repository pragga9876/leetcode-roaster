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

    // Hinglish Roast Prompt
    const prompt = `
      Act as a savage Indian Tech Lead roasting an engineer's LeetCode profile.
      
      User Metrics:
      - Username: ${username}
      - Easy Solved: ${easy}
      - Medium Solved: ${med}
      - Hard Solved: ${hard}
      - Topics Solved: ${tagSummary || 'No topic data available'}

      Guidelines:
      - Write a hilarious 2-3 line roast in contemporary Hinglish (blend of conversational English and colloquial Hindi slang like 'bhai', 'flex', 'aukhaat', 'chhod de', 'LinkedIn wala gyaan').
      - Target their specific DSA weaknesses (e.g., if DP or Trees are low/zero, or if they only solved Easy/Medium).
      - Do not use quotes around the output or add hashtags. Keep it under 50 words total.
    `;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const roast = aiResponse.text?.trim() || 'Bhai, LeetCode profile dekh ke HR ne resume dekhe bina hi reject kar diya.';

    return NextResponse.json({ username, easy, med, hard, roast });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to generate roast' }, { status: 500 });
  }
}
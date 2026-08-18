import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // 1. Fetch statistics from LeetCode GraphQL
    const lcRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
          }
        `,
        variables: { username },
      }),
    });

    const lcData = await lcRes.json();
    const user = lcData?.data?.matchedUser;

    if (!user) {
      return NextResponse.json({ error: 'LeetCode user not found!' }, { status: 404 });
    }

    const stats = user.submitStats.acSubmissionNum;
    const easy = stats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
    const med = stats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
    const hard = stats.find((s: any) => s.difficulty === 'Hard')?.count || 0;

    // 2. Request completion via Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `You are a savage, funny tech interviewer. Write a 2-sentence savage roast in Hinglish for a LeetCoder named ${username} who solved: Easy: ${easy}, Medium: ${med}, Hard: ${hard}. Keep it witty and concise.`,
        },
      ],
      model: 'openai/gpt-oss-20b', // Active Groq production model ID
    });

    const roast = completion.choices[0]?.message?.content || 'No roast generated.';

    return NextResponse.json({ username, easy, med, hard, roast });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // 1. Fetch LeetCode Data
    const lcRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
              profile {
                userAvatar
              }
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

    const avatar = user.profile?.userAvatar || '';
    const stats = user.submitStats.acSubmissionNum;
    const easy = stats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
    const med = stats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
    const hard = stats.find((s: any) => s.difficulty === 'Hard')?.count || 0;

    // 2. High-Impact Hinglish Reality Check Prompt
    const systemPrompt = `You are an Indian Senior SDE and brutal interviewer who roasts candidates in natural, sarcastic Hinglish.

CRITICAL RULES:
1. NO quotation marks (" or ') anywhere in the output.
2. NO generic AI templates, robotic phrases, or weird metaphors.
3. Write a substantial 3 to 4 sentence savage reality check in authentic Hinglish (Roman Hindi + Tech terms like OA, shortlisting, 2-pointer, DP, tier-3, contest rating).
4. Attack their stats directly:
   - If Hard count is low (<15): Remind them that tier-1 grads and 2000+ rating coders are solving DP & Graphs daily while they celebrate single-digit Hard counts.
   - If Easy/Medium is high but Hard is low: Call them out for staying in their comfort zone and grinding syntax instead of actual logic.
5. Make it punchy, funny, and deeply relatable for Indian engineering students/developers facing the job market.`;

    const userPrompt = `Candidate: ${username}
Easy Solved: ${easy}
Medium Solved: ${med}
Hard Solved: ${hard}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.85,
    });

    // Strip quotation marks cleanly
    let roast = completion.choices[0]?.message?.content || '';
    roast = roast.replace(/["']/g, '').trim();

    return NextResponse.json({ username, avatar, easy, med, hard, roast });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
// Supabase Edge Function (Deno runtime)
// Deploy with: supabase functions deploy solve-error
// Set the secret with:  supabase secrets set OPENAI_API_KEY=sk-...
//
// This function receives { codeSnippet, errorMessage, programmingLanguage },
// calls OpenAI, and returns a structured AiAnalysis object. The OpenAI key
// never reaches the browser because it only exists as a server-side secret.

import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  codeSnippet: string
  errorMessage: string
  programmingLanguage: string
}

const SYSTEM_PROMPT = `You are a senior software engineer helping debug code.
Given a code snippet, an error message, and a programming language, respond ONLY with
a JSON object matching this exact shape (no markdown, no commentary):

{
  "rootCause": string,
  "explanation": string,
  "correctedCode": string,
  "bestPractices": string[],
  "relatedConcepts": string[],
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidenceScore": number,
  "tokensUsed": number
}`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { codeSnippet, errorMessage, programmingLanguage } = (await req.json()) as RequestBody

    if (!codeSnippet || !errorMessage || !programmingLanguage) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userPrompt = `Language: ${programmingLanguage}\n\nCode:\n${codeSnippet}\n\nError:\n${errorMessage}`

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text()
      return new Response(JSON.stringify({ error: `OpenAI error: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const aiJson = await aiRes.json()
    const content = aiJson.choices?.[0]?.message?.content ?? '{}'
    const analysis = JSON.parse(content)
    analysis.tokensUsed = aiJson.usage?.total_tokens ?? 0

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

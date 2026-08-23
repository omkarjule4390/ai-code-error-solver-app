// Supabase Edge Function (Deno runtime) — uses Groq (free)
// Deploy via the Supabase dashboard Edge Functions editor.
// Set the secret with:  GROQ_API_KEY=gsk_...

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

const SYSTEM_PROMPT = `You are a senior software engineer and code intelligence assistant.
Given a code snippet, an error message/stack trace, and a programming language, analyze
the root cause and respond ONLY with a JSON object matching this exact shape (no markdown,
no commentary, no code fences):

{
  "errorType": string,            // e.g. "Syntax Error", "Runtime Error", "Type Error", "Import Error"
  "rootCause": string,            // short, accurate description of the actual cause
  "explanation": string,          // clear, beginner-friendly explanation of why it happened
  "lineNumber": number | null,    // best-guess line number if determinable, else null
  "fileName": string | null,      // file name if mentioned/determinable, else null
  "originalError": string,        // echo back the error message/stack trace as given
  "correctedCode": string,        // the best corrected version of the full code
  "solutions": [                  // 1-3 valid solutions; only include more than 1 when genuinely useful
    {
      "title": string,
      "description": string,
      "code": string,
      "whenToUse": string
    }
  ],
  "bestRecommendation": string,   // which solution to prefer and why
  "preventionTip": string,        // how to avoid this error in the future
  "bestPractices": string[],
  "relatedConcepts": string[],
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidenceScore": number,      // a fraction between 0 and 1, e.g. 0.95
  "tokensUsed": number
}

Use correct syntax and idioms for the given programming language only. Do not mix syntax
from other languages. Keep "solutions" to exactly one entry when there is only one clear fix.`

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

    const apiKey = Deno.env.get('GROQ_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userPrompt = `Language: ${programmingLanguage}\n\nCode:\n${codeSnippet}\n\nError:\n${errorMessage}`

    const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
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
      return new Response(JSON.stringify({ error: `Groq error: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const aiJson = await aiRes.json()
    const content = aiJson.choices?.[0]?.message?.content ?? '{}'
    const analysis = JSON.parse(content)

    // Defensive defaults so the frontend never renders empty/undefined sections.
    analysis.errorType = analysis.errorType ?? 'Unknown'
    analysis.lineNumber = analysis.lineNumber ?? null
    analysis.fileName = analysis.fileName ?? null
    analysis.originalError = analysis.originalError ?? errorMessage
    analysis.solutions = Array.isArray(analysis.solutions) ? analysis.solutions : []
    analysis.bestRecommendation = analysis.bestRecommendation ?? ''
    analysis.preventionTip = analysis.preventionTip ?? ''
    analysis.bestPractices = Array.isArray(analysis.bestPractices) ? analysis.bestPractices : []
    analysis.relatedConcepts = Array.isArray(analysis.relatedConcepts) ? analysis.relatedConcepts : []
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

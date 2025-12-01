// Supabase Edge Function: evaluate-task
// Runs AI evaluation on a coding task using Google Gemini API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EvaluationResult {
  score_overall: number
  strengths: string
  improvements: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { taskId, userId } = await req.json()

    if (!taskId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing taskId or userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch the task and verify ownership
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (taskError || !task) {
      return new Response(
        JSON.stringify({ error: 'Task not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare the prompt for Gemini
    const prompt = `You are an expert code reviewer and technical interviewer. Your task is to evaluate coding assignments submitted by candidates.

Analyze the provided task description and code (if available) and provide a structured evaluation.

You MUST respond with ONLY valid JSON in this exact format (no markdown, no code blocks, just pure JSON):
{
  "score_overall": <number between 0-100>,
  "strengths": "<markdown text describing what was done well>",
  "improvements": "<markdown text describing areas for improvement>"
}

Scoring guidelines:
- 90-100: Exceptional - Production-ready, well-architected, follows best practices
- 70-89: Good - Solid implementation with minor issues
- 50-69: Fair - Functional but needs significant improvements
- 0-49: Needs Work - Major issues or incomplete

Be specific and actionable in your feedback. Use markdown formatting for clarity.

Please evaluate the following coding task:

**Title:** ${task.title}

**Description:**
${task.description}

${task.code_url ? `**Code Repository:** ${task.code_url}` : ''}

Provide your evaluation as JSON only.`

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => ({}))
      console.error('Gemini API error:', JSON.stringify(errorData))
      const errorMessage = errorData?.error?.message || 'AI evaluation failed. Please try again.'
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiData = await geminiResponse.json()
    const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawContent) {
      console.error('No content in Gemini response:', JSON.stringify(geminiData))
      return new Response(
        JSON.stringify({ error: 'No response from AI. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the AI response - clean up any markdown code blocks if present
    let evaluation: EvaluationResult
    try {
      let jsonContent = rawContent.trim()
      // Remove markdown code blocks if present
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.slice(7)
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.slice(3)
      }
      if (jsonContent.endsWith('```')) {
        jsonContent = jsonContent.slice(0, -3)
      }
      jsonContent = jsonContent.trim()
      
      evaluation = JSON.parse(jsonContent)
      
      // Validate the response structure
      if (
        typeof evaluation.score_overall !== 'number' ||
        evaluation.score_overall < 0 ||
        evaluation.score_overall > 100 ||
        typeof evaluation.strengths !== 'string' ||
        typeof evaluation.improvements !== 'string'
      ) {
        throw new Error('Invalid evaluation structure')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', rawContent)
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI evaluation. Please try again.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert the evaluation into the database
    const { data: insertedEvaluation, error: insertError } = await supabase
      .from('evaluations')
      .insert({
        task_id: taskId,
        model: 'gemini-2.0-flash',
        score_overall: Math.round(evaluation.score_overall),
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        raw_response: geminiData,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to insert evaluation:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save evaluation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update task status to 'evaluated'
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ status: 'evaluated' })
      .eq('id', taskId)

    if (updateError) {
      console.error('Failed to update task status:', updateError)
      // Non-critical error, continue
    }

    // Return the evaluation
    return new Response(
      JSON.stringify({
        id: insertedEvaluation.id,
        score_overall: insertedEvaluation.score_overall,
        strengths: insertedEvaluation.strengths,
        improvements: insertedEvaluation.improvements,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


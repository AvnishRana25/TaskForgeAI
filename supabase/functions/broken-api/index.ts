// Supabase Edge Function: broken-api
// This file demonstrates a BROKEN implementation followed by a REFACTORED version

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// ============================================================
// BROKEN VERSION - Intentionally bad implementation
// Problems:
// - No TypeScript types
// - Poor error handling (just console.log)
// - Deeply nested conditionals
// - Magic strings everywhere
// - No input validation
// - Inconsistent response format
// - No CORS handling
// ============================================================

// @ts-nocheck - Disabling type checking for the broken version
async function handleRequest_BROKEN(req: any) {
  // Bad: No CORS handling
  // Bad: Using any types everywhere
  
  var body = await req.json()
  
  // Bad: No validation
  var taskId = body.taskId
  var action = body.action
  
  // Bad: Using var instead of const/let
  var supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )
  
  // Bad: Deeply nested conditionals
  if (action == 'get') {
    if (taskId) {
      var result = await supabase.from('tasks').select('*').eq('id', taskId)
      if (result.data) {
        if (result.data.length > 0) {
          return new Response(JSON.stringify(result.data[0]))
        } else {
          console.log('not found')
          return new Response('not found')
        }
      } else {
        console.log('error')
        return new Response('error')
      }
    } else {
      console.log('no task id')
      return new Response('no task id')
    }
  } else if (action == 'list') {
    var result = await supabase.from('tasks').select('*')
    if (result.data) {
      return new Response(JSON.stringify(result.data))
    } else {
      return new Response('error')
    }
  } else if (action == 'delete') {
    if (taskId) {
      var result = await supabase.from('tasks').delete().eq('id', taskId)
      if (result.error) {
        console.log('delete failed')
        return new Response('delete failed')
      } else {
        return new Response('ok')
      }
    } else {
      return new Response('no task id')
    }
  } else {
    return new Response('unknown action')
  }
}


// ============================================================
// REFACTORED VERSION - Clean, type-safe implementation
// Improvements:
// - Proper TypeScript types
// - Consistent error handling with proper HTTP status codes
// - Flat control flow with early returns
// - Proper CORS handling
// - Input validation
// - Consistent JSON response format
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Type definitions
interface ApiRequest {
  action: 'get' | 'list' | 'delete'
  taskId?: string
  userId?: string
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Utility function to create consistent JSON responses
function jsonResponse<T>(
  body: ApiResponse<T>,
  status: number = 200
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Utility function to create error responses
function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ success: false, error: message }, status)
}

// Input validation
function validateRequest(body: unknown): body is ApiRequest {
  if (!body || typeof body !== 'object') return false
  
  const req = body as Record<string, unknown>
  
  if (!req.action || typeof req.action !== 'string') return false
  if (!['get', 'list', 'delete'].includes(req.action)) return false
  
  if (req.taskId !== undefined && typeof req.taskId !== 'string') return false
  if (req.userId !== undefined && typeof req.userId !== 'string') return false
  
  return true
}

// Get Supabase client
function getSupabaseClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!url || !key) {
    throw new Error('Missing Supabase configuration')
  }
  
  return createClient(url, key)
}

// Handler functions for each action
async function handleGet(taskId: string | undefined) {
  if (!taskId) {
    return errorResponse('taskId is required for get action')
  }
  
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      return errorResponse('Task not found', 404)
    }
    return errorResponse(`Database error: ${error.message}`, 500)
  }
  
  return jsonResponse({ success: true, data })
}

async function handleList() {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    return errorResponse(`Database error: ${error.message}`, 500)
  }
  
  return jsonResponse({ success: true, data })
}

async function handleDelete(taskId: string | undefined) {
  if (!taskId) {
    return errorResponse('taskId is required for delete action')
  }
  
  const supabase = getSupabaseClient()
  
  // First check if task exists
  const { data: existing } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .single()
  
  if (!existing) {
    return errorResponse('Task not found', 404)
  }
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
  
  if (error) {
    return errorResponse(`Failed to delete task: ${error.message}`, 500)
  }
  
  return jsonResponse({ success: true, data: { deleted: taskId } })
}

// Main request handler
async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }
  
  try {
    // Parse and validate request body
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return errorResponse('Invalid JSON body')
    }
    
    if (!validateRequest(body)) {
      return errorResponse('Invalid request. Required: action (get|list|delete)')
    }
    
    // Route to appropriate handler
    switch (body.action) {
      case 'get':
        return await handleGet(body.taskId)
      case 'list':
        return await handleList()
      case 'delete':
        return await handleDelete(body.taskId)
      default:
        return errorResponse('Unknown action')
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return errorResponse('An unexpected error occurred', 500)
  }
}

// Export the refactored version
serve(handleRequest)

// Export broken version for demonstration (not used)
export { handleRequest_BROKEN }


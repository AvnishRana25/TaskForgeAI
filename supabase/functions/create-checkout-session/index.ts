// Supabase Edge Function: create-checkout-session
// Creates a Stripe Checkout session for unlocking full reports

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID')
    const appPublicUrl = Deno.env.get('APP_PUBLIC_URL')

    if (!stripeSecretKey || !stripePriceId || !appPublicUrl) {
      console.error('Missing environment variables:', {
        hasStripeKey: !!stripeSecretKey,
        hasPriceId: !!stripePriceId,
        hasAppUrl: !!appPublicUrl,
      })
      return new Response(
        JSON.stringify({ error: 'Payment system not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize clients
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Verify task ownership
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, user_id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (taskError || !task) {
      return new Response(
        JSON.stringify({ error: 'Task not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if there's already a paid payment for this task
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .eq('status', 'paid')
      .single()

    if (existingPayment) {
      return new Response(
        JSON.stringify({ error: 'Report already unlocked' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${appPublicUrl}/task/${taskId}?payment=success`,
      cancel_url: `${appPublicUrl}/task/${taskId}?payment=cancelled`,
      metadata: {
        task_id: taskId,
        user_id: userId,
      },
      client_reference_id: taskId,
    })

    if (!session.url) {
      return new Response(
        JSON.stringify({ error: 'Failed to create checkout session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create payment record (insert new one for each checkout attempt)
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        task_id: taskId,
        provider: 'stripe',
        provider_session_id: session.id,
        amount: session.amount_total || 499, // Default to $4.99 in cents
        currency: session.currency || 'usd',
        status: 'pending',
      })

    if (paymentError) {
      console.error('Failed to create payment record:', paymentError)
      // Continue anyway - webhook will handle it
    }

    // Return the checkout URL
    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


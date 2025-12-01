// Supabase Edge Function: stripe-webhook
// Handles Stripe webhook events for payment completion

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!stripeSecretKey || !stripeWebhookSecret) {
      console.error('Missing Stripe configuration')
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize clients
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the raw body
    const body = await req.text()

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        stripeWebhookSecret
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        console.log('Processing checkout.session.completed:', session.id)

        // Find the payment by provider_session_id
        const { data: payment, error: findError } = await supabase
          .from('payments')
          .select('*')
          .eq('provider_session_id', session.id)
          .single()

        if (findError || !payment) {
          // Try to create from metadata if not found
          const taskId = session.metadata?.task_id || session.client_reference_id
          const userId = session.metadata?.user_id

          if (taskId && userId) {
            const { error: insertError } = await supabase
              .from('payments')
              .insert({
                user_id: userId,
                task_id: taskId,
                provider: 'stripe',
                provider_session_id: session.id,
                amount: session.amount_total || 499,
                currency: session.currency || 'usd',
                status: 'paid',
              })

            if (insertError) {
              console.error('Failed to create payment from webhook:', insertError)
              return new Response(
                JSON.stringify({ error: 'Failed to create payment record' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }
          } else {
            console.error('Payment not found and no metadata:', session.id)
            return new Response(
              JSON.stringify({ error: 'Payment record not found' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        } else {
          // Update existing payment
          const { error: updateError } = await supabase
            .from('payments')
            .update({
              status: 'paid',
              amount: session.amount_total || payment.amount,
              currency: session.currency || payment.currency,
            })
            .eq('id', payment.id)

          if (updateError) {
            console.error('Failed to update payment:', updateError)
            return new Response(
              JSON.stringify({ error: 'Failed to update payment record' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

        console.log('Payment completed successfully for session:', session.id)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session

        // Mark payment as failed
        const { error: updateError } = await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('provider_session_id', session.id)

        if (updateError) {
          console.error('Failed to update expired payment:', updateError)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Return success
    return new Response(
      JSON.stringify({ received: true }),
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


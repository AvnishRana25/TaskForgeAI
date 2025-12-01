# TaskForge AI - Complete Setup Guide

This guide walks you through setting up TaskForge AI from scratch. Follow each step carefully.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** installed ([Download here](https://nodejs.org/))
- [ ] **npm** (comes with Node.js)
- [ ] A **Supabase account** ([Sign up free](https://supabase.com))
- [ ] An **OpenAI account** with API credits ([Sign up](https://platform.openai.com))
- [ ] A **Stripe account** ([Sign up](https://stripe.com))

Verify Node.js installation:

```bash
node --version  # Should be v18.x.x or higher
npm --version   # Should be v9.x.x or higher
```

---

## 🔧 Step 1: Create Supabase Project

### 1.1 Create New Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Organization**: Select or create one
   - **Project name**: `taskforge-ai`
   - **Database password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait ~2 minutes for setup to complete

### 1.2 Get Your API Credentials

1. In your project dashboard, go to **Settings** (gear icon) → **API**
2. Copy these values and save them somewhere safe:

| Setting      | Environment Variable     | Where to Find                               |
| ------------ | ------------------------ | ------------------------------------------- |
| Project URL  | `VITE_SUPABASE_URL`      | Under "Project URL"                         |
| anon public  | `VITE_SUPABASE_ANON_KEY` | Under "Project API keys"                    |
| service_role | (for edge functions)     | Under "Project API keys" - **KEEP SECRET!** |

---

## 🗄️ Step 2: Setup Database

### 2.1 Run the Migration

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the entire contents of `supabase/migrations/001_init.sql`
4. Paste into the SQL editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)

You should see: "Success. No rows returned"

### 2.2 Verify Tables Created

1. Go to **Table Editor** (left sidebar)
2. You should see three tables:
   - `tasks`
   - `evaluations`
   - `payments`

---

## 🔐 Step 3: Configure Authentication

### 3.1 Enable Email Auth

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled (should be by default)
3. Settings to verify:
   - Confirm email: **OFF** (for easier testing)
   - Secure email change: **OFF** (for development)

### 3.2 Set Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:5173`
3. Under **Redirect URLs**, add:
   - `http://localhost:5173`
   - `http://localhost:5173/**`

---

## 💳 Step 4: Setup Stripe (Test Mode)

### 4.1 Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **IMPORTANT**: Toggle to **Test Mode** (switch in top-right corner)
3. Go to **Developers** → **API Keys**
4. Copy the **Secret key** (starts with `sk_test_`)

### 4.2 Create a Product and Price

1. Go to **Products** → **Add Product**
2. Fill in:
   - **Name**: "Full Evaluation Report"
   - **Description**: "Unlock detailed AI feedback for your coding task"
3. Under **Pricing**:
   - **Pricing model**: One-time
   - **Amount**: $4.99
4. Click **"Add product"**
5. After creation, click on the product
6. Copy the **Price ID** (starts with `price_`)

### 4.3 Setup Webhook (Do After Deploying Edge Functions)

1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://YOUR-PROJECT-ID.supabase.co/functions/v1/stripe-webhook`
   - Replace `YOUR-PROJECT-ID` with your actual Supabase project ID
4. **Events to listen for**:
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)

---

## 🤖 Step 5: Get OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Click **"Create new secret key"**
3. Name it: "TaskForge AI"
4. Copy the key (starts with `sk-`) - **you won't see it again!**

**Note**: Ensure you have API credits. New accounts get $5 free credits.

---

## ⚡ Step 6: Deploy Edge Functions

### 6.1 Install Supabase CLI

```bash
npm install -g supabase
```

Verify installation:

```bash
supabase --version
```

### 6.2 Login and Link Project

```bash
# Login to Supabase
supabase login

# Navigate to project root
cd /path/to/TaskForgeAI

# Link to your project
supabase link --project-ref YOUR-PROJECT-ID
```

To find your project ID:

- Go to Supabase Dashboard → Settings → General
- It's the "Reference ID" (looks like: `abcdefghijklmnop`)

### 6.3 Set Edge Function Secrets

In Supabase Dashboard:

1. Go to **Edge Functions** → **Secrets** (or **Project Settings** → **Edge Functions**)
2. Add each secret:

| Secret Name             | Value                                             |
| ----------------------- | ------------------------------------------------- |
| `OPENAI_API_KEY`        | Your OpenAI API key (`sk-...`)                    |
| `STRIPE_SECRET_KEY`     | Your Stripe secret key (`sk_test_...`)            |
| `STRIPE_PRICE_ID`       | Your Stripe price ID (`price_...`)                |
| `STRIPE_WEBHOOK_SECRET` | Your webhook secret (`whsec_...`)                 |
| `APP_PUBLIC_URL`        | `http://localhost:5173` (update after deployment) |

### 6.4 Deploy Functions

```bash
cd /path/to/TaskForgeAI

# Deploy all edge functions
supabase functions deploy evaluate-task
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy broken-api
```

You should see "Function deployed successfully" for each.

---

## 💻 Step 7: Setup Frontend

### 7.1 Install Dependencies

```bash
cd web
npm install
```

### 7.2 Configure Environment Variables

Create a `.env` file in the `web` directory:

```bash
# In web/ directory
cat > .env << EOF
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF
```

Replace with your actual values from Step 1.2.

### 7.3 Start Development Server

```bash
npm run dev
```

The app should now be running at: **http://localhost:5173**

---

## ✅ Step 8: Test the Application

### 8.1 Create an Account

1. Go to http://localhost:5173
2. Click **"Get Started"**
3. Enter email and password
4. Click **"Create Account"**

### 8.2 Create a Task

1. Click **"New Task"**
2. Fill in:
   - **Title**: "React Todo App"
   - **Description**: "Built a todo app with React hooks, local storage persistence, and filter functionality"
   - **Code URL**: (optional) your GitHub repo
3. Click **"Create Task"**

### 8.3 Run AI Evaluation

1. On the task detail page, click **"Run AI Evaluation"**
2. Wait 10-20 seconds for the AI to analyze
3. You should see a score and summary

### 8.4 Test Payment (Test Mode)

1. Click **"Unlock for $4.99"**
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any CVC
5. Any ZIP code
6. Complete payment
7. You should be redirected back and see the full report

---

## 🚀 Step 9: Deploy to Production (Vercel)

### 9.1 Push to GitHub

```bash
cd /path/to/TaskForgeAI
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/taskforge-ai.git
git push -u origin main
```

### 9.2 Deploy on Vercel

1. Go to [Vercel](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `web`
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **"Deploy"**

### 9.3 Update Configuration

After deployment, update these settings:

1. **Supabase Auth URLs**:

   - Go to Authentication → URL Configuration
   - Update Site URL to your Vercel URL
   - Add Vercel URL to Redirect URLs

2. **Edge Function Secret**:

   - Update `APP_PUBLIC_URL` to your Vercel URL

3. **Stripe Webhook**:
   - Update webhook endpoint URL to use your Supabase project URL

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

- Ensure `.env` file exists in `web/` directory
- Check that variable names start with `VITE_`
- Restart the dev server after changes

### "Task not found or access denied"

- Check that RLS policies were created correctly
- Verify you're logged in
- Check browser console for detailed errors

### "AI evaluation failed"

- Verify `OPENAI_API_KEY` is set correctly in Edge Function secrets
- Check you have OpenAI API credits
- Check Edge Function logs in Supabase dashboard

### "Payment system not configured"

- Verify all Stripe secrets are set in Edge Functions
- Ensure you're in Stripe Test Mode
- Check the Price ID is correct

### Edge Function 500 errors

- Go to Supabase Dashboard → Edge Functions → Logs
- Check for specific error messages
- Verify all secrets are set correctly

---

## 📝 Summary of All Environment Variables

### Frontend (web/.env)

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Edge Functions (Supabase Secrets)

```
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
APP_PUBLIC_URL=https://your-app.vercel.app
```

---

## 🎉 You're Done!

Your TaskForge AI application should now be fully functional. Test all features:

1. ✅ User signup/login
2. ✅ Create tasks
3. ✅ Run AI evaluations
4. ✅ View evaluation summaries
5. ✅ Process payments (test mode)
6. ✅ View full reports after payment
7. ✅ View reports history

If you encounter issues, check the troubleshooting section or open an issue on GitHub.

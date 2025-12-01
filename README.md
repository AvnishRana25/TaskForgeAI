<div align="center">

# 🚀 TaskForge AI

### _AI-Powered Coding Task Evaluator_

[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)

<br />

**A production-ready SaaS application that empowers developers to submit coding tasks and receive instant, AI-powered evaluations with detailed feedback, scoring, and actionable insights.**

[Live Demo](#) · [Setup Guide](./SETUP_GUIDE.md) · [Report Bug](../../issues)

<br />

<img src="https://raw.githubusercontent.com/github/explore/main/topics/react/react.png" width="60" />
&nbsp;&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/github/explore/main/topics/typescript/typescript.png" width="60" />
&nbsp;&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/supabase/supabase/master/packages/common/assets/images/supabase-logo-icon.png" width="60" />

</div>

---

## ✨ What Makes This Project Stand Out

<table>
<tr>
<td width="50%">

### 🎯 **Production-Ready Architecture**

- Clean, scalable codebase structure
- Type-safe from frontend to backend
- Secure authentication with RLS policies
- Real payment integration (not mocked)

</td>
<td width="50%">

### 🎨 **Premium UI/UX Design**

- Modern glassmorphism aesthetics
- Smooth micro-interactions & animations
- Responsive across all devices
- Dark theme with emerald accents

</td>
</tr>
<tr>
<td width="50%">

### 🤖 **Real AI Integration**

- Powered by Google Gemini 2.0 Flash
- Detailed code quality analysis
- Actionable improvement suggestions
- Consistent JSON response parsing

</td>
<td width="50%">

### 💳 **Complete Payment Flow**

- Stripe Checkout integration
- Webhook handling for payment status
- Freemium model implementation
- Test mode ready for demo

</td>
</tr>
</table>

---

## 🎬 Features Overview

| Feature                   | Description                                                         |
| ------------------------- | ------------------------------------------------------------------- |
| 🔐 **Authentication**     | Secure email/password auth via Supabase with session management     |
| 📝 **Task Submission**    | Create coding tasks with descriptions, code snippets, or repo links |
| 🤖 **AI Evaluation**      | Get instant feedback with 0-100 scores and detailed analysis        |
| 💰 **Payment Gate**       | Unlock full reports via Stripe Checkout ($4.99 one-time)            |
| 📊 **Reports Dashboard**  | View history of all evaluations with payment status                 |
| 🔒 **Row Level Security** | Users can only access their own data                                |

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="33%">

### Frontend

![React](https://img.shields.io/badge/-React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/-React_Router_v6-CA4245?style=flat-square&logo=reactrouter&logoColor=white)

</td>
<td align="center" width="33%">

### Backend

![Supabase](https://img.shields.io/badge/-Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Deno](https://img.shields.io/badge/-Deno-000000?style=flat-square&logo=deno&logoColor=white)
![Edge Functions](https://img.shields.io/badge/-Edge_Functions-3FCF8E?style=flat-square&logo=supabase&logoColor=white)

</td>
<td align="center" width="33%">

### Integrations

![Gemini](https://img.shields.io/badge/-Gemini_AI-8E75B2?style=flat-square&logo=google&logoColor=white)
![Stripe](https://img.shields.io/badge/-Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

| Requirement      | Version   | Link                                              |
| ---------------- | --------- | ------------------------------------------------- |
| Node.js          | 18+       | [Download](https://nodejs.org/)                   |
| Supabase CLI     | Latest    | `brew install supabase`                           |
| Supabase Account | Free      | [Sign Up](https://supabase.com)                   |
| Google AI Studio | Free      | [Get API Key](https://aistudio.google.com/apikey) |
| Stripe Account   | Test Mode | [Sign Up](https://stripe.com)                     |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/TaskForgeAI.git
cd TaskForgeAI

# 2. Install frontend dependencies
cd web
npm install

# 3. Create environment file
cat > .env << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF

# 4. Start development server
npm run dev
```

> 📖 **For complete setup including Supabase, Stripe, and deployment, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## 🐛 Broken Code Examples

This project includes **intentionally broken code** alongside refactored versions to demonstrate AI-assisted code improvement:

<details>
<summary><b>1. 🔘 BrokenButton Component</b> — Click to expand</summary>

### Before (Broken)

```tsx
// ❌ No types, inline styles, wrong element, no accessibility
export function BrokenButton_BROKEN(props: any) {
  return (
    <div
      style={{ backgroundColor: props.color || "blue", padding: "10px" }}
      onclick={props.onClick}
    >
      {props.children}
    </div>
  );
}
```

### After (Refactored)

```tsx
// ✅ Type-safe, accessible, Tailwind styling, variants
interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
```

</details>

<details>
<summary><b>2. ⚡ Broken API Edge Function</b> — Click to expand</summary>

### Before (Broken)

```typescript
// ❌ No CORS, nested conditionals, no error handling
Deno.serve(async (req) => {
  const body = await req.json();
  if (body.action == "getData") {
    if (body.id) {
      // deeply nested logic...
    }
  }
  return new Response(JSON.stringify({ result: "ok" }));
});
```

### After (Refactored)

```typescript
// ✅ CORS headers, flat control flow, typed responses
const corsHeaders = { 'Access-Control-Allow-Origin': '*', ... }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, id } = await req.json() as RequestBody
    const result = await handleAction(action, id)
    return Response.json({ success: true, data: result }, { headers: corsHeaders })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 })
  }
})
```

</details>

<details>
<summary><b>3. 📝 Formatting Helpers</b> — Click to expand</summary>

### Before (Broken)

```typescript
// ❌ Deeply nested, magic numbers, any types
export function formatScoreDisplay_BROKEN(score: any): any {
  if (score !== null && score !== undefined) {
    if (typeof score === "number") {
      if (score >= 0) {
        if (score <= 100) {
          if (score >= 90) {
            return { text: score + "/100", color: "green", label: "Excellent" };
          } else {
            if (score >= 70) {
              /* more nesting... */
            }
          }
        }
      }
    }
  }
}
```

### After (Refactored)

```typescript
// ✅ Clean, typed, configurable
const SCORE_THRESHOLDS = { excellent: 90, good: 70, fair: 50 } as const;

export function formatScoreDisplay(score: number | null): ScoreDisplay {
  const level = getScoreLevel(score);
  return { text: `${score}/100`, ...SCORE_CONFIG[level] };
}
```

</details>

---

## 🧪 Testing the Application

### User Flow

```
1. 📝 Sign Up     → Create account with email/password
2. ➕ New Task    → Submit coding task with description + code
3. 🤖 Evaluate    → AI analyzes and scores your code (0-100)
4. 👀 Preview     → See score and blurred report preview
5. 💳 Unlock      → Pay $4.99 via Stripe to see full report
6. 📊 Full Report → View detailed strengths & improvements
```

### Stripe Test Card

```
Card Number:  4242 4242 4242 4242
Expiry:       Any future date (e.g., 12/34)
CVC:          Any 3 digits (e.g., 123)
ZIP:          Any 5 digits (e.g., 12345)
```

---

## 📊 Database Schema

```sql
┌─────────────────────────────────────────────────────────────┐
│                         TASKS                                │
├─────────────────────────────────────────────────────────────┤
│ id            UUID PRIMARY KEY                              │
│ user_id       UUID REFERENCES auth.users                    │
│ title         TEXT NOT NULL                                 │
│ description   TEXT NOT NULL                                 │
│ code_submission TEXT                                        │
│ repo_url      TEXT                                          │
│ status        pending | evaluated | error                   │
│ created_at    TIMESTAMP                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      EVALUATIONS                             │
├─────────────────────────────────────────────────────────────┤
│ id            UUID PRIMARY KEY                              │
│ task_id       UUID REFERENCES tasks                         │
│ model         TEXT (gemini-2.0-flash)                       │
│ score_overall INTEGER (0-100)                               │
│ strengths     TEXT                                          │
│ improvements  TEXT                                          │
│ detailed_feedback TEXT                                      │
│ created_at    TIMESTAMP                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       PAYMENTS                               │
├─────────────────────────────────────────────────────────────┤
│ id            UUID PRIMARY KEY                              │
│ user_id       UUID REFERENCES auth.users                    │
│ task_id       UUID REFERENCES tasks                         │
│ amount        INTEGER (cents)                               │
│ status        pending | paid | failed                       │
│ stripe_session_id TEXT                                      │
│ created_at    TIMESTAMP                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features

| Feature                | Implementation                        |
| ---------------------- | ------------------------------------- |
| **Row Level Security** | Users can only CRUD their own data    |
| **JWT Verification**   | Edge functions verify Supabase tokens |
| **CORS Protection**    | Configured for production domains     |
| **Secure Secrets**     | API keys stored in Supabase Vault     |
| **Webhook Signing**    | Stripe webhook signature verification |

---

## 📈 Performance Optimizations

- ⚡ **Vite** - Lightning-fast HMR and optimized builds
- 🎨 **Tailwind CSS** - Utility-first with purged unused styles
- 🔄 **React 18** - Concurrent rendering and automatic batching
- 🌐 **Edge Functions** - Low-latency serverless execution
- 📦 **Code Splitting** - Route-based lazy loading ready

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
# Push to GitHub, then:
# 1. Import repo in Vercel
# 2. Set root directory: web
# 3. Add environment variables
# 4. Deploy!
```

### Edge Functions (Supabase)

```bash
supabase functions deploy evaluate-task
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

---

## 📄 License

MIT License - feel free to use this for your own projects!

---

<div align="center">

### Built with 💚 for the Gen-AI Developer Hiring Challenge

**[⬆ Back to Top](#-taskforge-ai)**

</div>

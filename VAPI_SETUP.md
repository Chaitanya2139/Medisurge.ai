# Vapi AI Setup Instructions

## ❌ Current Error: 401 Unauthorized

You're getting this error because the **Public Key** is missing or incorrect.

## 🔑 How to Get Your Vapi Credentials

### Step 1: Get Your Public Key

1. Go to **[Vapi Dashboard](https://dashboard.vapi.ai/)**
2. Navigate to **Settings** → **API Keys** (or similar section)
3. Look for your **Public Key** or **Publishable Key**
   - It might be labeled as "Web SDK Key" or "Public Key"
   - Format varies but is usually a long alphanumeric string
   - **This is NOT the same as your Assistant ID!**

### Step 2: Update .env File

Open `.env` file in the project root and replace:

```env
VITE_VAPI_PUBLIC_KEY=your_actual_public_key_here
```

With your actual public key from Step 1.

### Step 3: Verify Assistant ID

Your Assistant ID is already set: `4193d057-856a-4c00-b6de-903456050653`

To verify it's correct:
1. Go to **Vapi Dashboard** → **Assistants**
2. Find your medical triage assistant
3. Copy its ID and compare with the value in `.env`

### Step 4: Restart Dev Server

After updating `.env`:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 🧪 Testing

After setup, press the SOS button in the patient portal. You should see:
- ✅ "Vapi client initialized"
- ✅ "AI Agent is connecting..."
- ✅ Voice call starts

## 🚨 Troubleshooting

### Still getting 401?
- Double-check your Public Key is correct
- Make sure you're using the **Public/Publishable Key**, not a Private/Secret Key
- Verify your Vapi account is active

### CORS errors?
- This is usually caused by invalid credentials
- Should resolve once you add the correct Public Key

### Assistant not found?
- Verify the Assistant ID in your Vapi Dashboard
- Make sure the assistant is published/active

## 📚 Resources

- [Vapi Documentation](https://docs.vapi.ai/)
- [Vapi Web SDK Guide](https://docs.vapi.ai/sdk/web)
- [Dashboard](https://dashboard.vapi.ai/)

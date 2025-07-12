# LifeMind – AI Memory Assistant

LifeMind is an AI-powered memory assistant that helps you set reminders, priorities, and tasks using natural language and voice. It features robust speech-to-text (Deepgram), intelligent intent extraction, and a conversational chatbot interface. Built with Next.js, Convex, Clerk, and Expo (React Native).

---

## 🚀 Features
- Voice and text input for reminders, meetings, and priorities
- AI-powered extraction of core action/intent (e.g., "call mom" instead of full sentence)
- Natural language date/time parsing (e.g., "tomorrow at 10AM")
- Conversational approval flow ("yes", "please do", etc.)
- Multi-platform: Web (Next.js), Native (Expo/React Native)
- Clerk authentication, Convex backend
- Open source AI and STT (Deepgram by default)

---

## 🛠️ Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (recommended) or npm
- [Convex CLI](https://docs.convex.dev/cli/install) (`npm install -g convex`)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (for native app)
- [Git](https://git-scm.com/)

---

## ⚡️ Quick Start

### 1. **Clone the Repo**
```sh
git clone https://github.com/maheshwari522/LifeMind.git
cd LifeMind
```

### 2. **Install Dependencies**
```sh
pnpm install
# or
npm install
```

### 3. **Set Up Environment Variables**
- Copy `.env.example` to `.env.local` in each app/package as needed.
- Fill in your API keys (Deepgram, Clerk, Convex, etc.).

### 4. **Start the Backend (Convex)**
```sh
cd packages/backend
npm install # if node_modules missing
npm run dev
```

### 5. **Start the Web App**
```sh
cd apps/web
npm install # if node_modules missing
npm run dev
# Visit http://localhost:3000 (or next available port)
```

### 6. **Start the Native App (Expo)**
```sh
cd apps/native
npm install # if node_modules missing
npm run dev
# Scan QR code with Expo Go or run on simulator
```

---

## ⚙️ Environment Variables
- **Deepgram API Key**: For speech-to-text
- **Clerk Keys**: For authentication
- **Convex URL/Keys**: For backend
- See `.env.example` in each app for details

---

## 🧩 Project Structure
```
narbhacks/
  apps/
    web/      # Next.js web app
    native/   # Expo/React Native app
  packages/
    backend/  # Convex backend
```

---

## 🐞 Troubleshooting
- **Port in use**: If port 3000 is busy, Next.js will use the next available port (e.g., 3001, 3002, ...)
- **Missing node_modules**: Run `npm install` or `pnpm install` in the relevant directory
- **Convex errors**: Ensure Convex CLI is installed and you are logged in
- **Deepgram errors**: Check your API key and network
- **404s for Whisper models**: Deepgram is used by default; browser Whisper is not supported
- **Dashboard 404**: The dashboard page has been removed; use the main/home page

---

## 🤝 Contributing
Pull requests and issues are welcome! Please open an issue for bugs or feature requests.

---

## 📄 License
[MIT](LICENSE)

---

## 🙏 Credits
- [Convex](https://convex.dev/)
- [Clerk](https://clerk.com/)
- [Deepgram](https://deepgram.com/)
- [Next.js](https://nextjs.org/)
- [Expo](https://expo.dev/)
- [Open Source AI](https://github.com/)

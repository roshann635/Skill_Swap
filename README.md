# ⚡ SkillSwap: Campus Time-Banking Ecosystem

SkillSwap is a decentralized micro-freelancing platform designed for college campuses. It utilizes a **Time-Credit Economy** where 1 Hour of service = 1 Credit.

## 🏛️ Project Architecture
- **Backend:** Spring Boot (Java 17+) + MongoDB Atlas.
- **Frontend:** Next.js 15 (TypeScript) + Tailwind CSS + Framer Motion.
- **Auth:** Clerk (Campus-ready identity management).

## 🚀 Quick Start
1. **Backend:**
   - Open `skillswap` in IntelliJ/VS Code.
   - Run `SkillswapApplication.java`.
   - Ensure port `8080` is free.

2. **Frontend:**
   - Navigate to `skillswap-ui`.
   - Run `npm install`.
   - Run `npm run dev`.
   - Access at `http://localhost:3000`.

## 🛡️ Important Security Note
Sensitive files like `application.properties` and `.env.local` are **ignored** by Git. See `HANDOVER.md` for the required keys.

# 🤝 SkillSwap Handover Guide

This document explains the core logic and secret configurations needed to run SkillSwap on a new machine.

## 🧠 Core Business Logic: The "Time Handshake"
SkillSwap is not just a marketplace; it's a **Ledger**.
1. **Posting:** When a user posts a "Bounty", the credits are **Escrowed** (locked) in the database.
2. **Accepting:** Another student accepts the gig.
3. **Handshake:** When the work is done, the Seeker releases the escrow, and credits move to the Provider's wallet.
4. **Trust Algorthm:** We use a custom formula $S = (\frac{\sum (R_i \cdot C_i)}{n}) \times (\frac{T_{comp}}{T_{total}})$ to calculate reputation.

## 🔑 Secret Configuration (Crucial!)
Because these files are ignored by `.gitignore`, you must manually recreate them on your laptop:

### 1. Java Backend (`skillswap/src/main/resources/application.properties`)
```properties
spring.data.mongodb.uri=mongodb+srv://bhoomikabra12_db:Bhoomi1266@cluster0.uayrpgh.mongodb.net/skillswap?retryWrites=true&w=majority&appName=Cluster0
server.port=8080
```

### 2. Frontend (`skillswap-ui/.env.local`)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZnVuLXB1Zy0zNi5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_HngjHupVSsiPOqxaoh9zepbjvfSurTGY5CoyUlWenx
NEXT_PUBLIC_API_URL=http://127.0.0.1:8080/api
```

## 🛠️ Developmental Map
- **Gigs:** Handled in `GigService.java`.
- **Transactions:** Handled in `CreditService.java` (Uses MongoDB @Transactional for ACID safety).
- **Styles:** Global styles in `globals.css` (Glassmorphism theme).
- **Authentication:** Middleware in `middleware.ts` protects `/dashboard`.

## 📌 Next Steps for Development
- Implement the QR-Code Handshake flow for physical task verification.
- Add real-time notifications using WebSockets.
- Build the "Report User" module.

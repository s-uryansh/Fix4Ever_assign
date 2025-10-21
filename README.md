# Fix4Ever Assignment

Simple full-stack project for a real-time multi-vendor service booking platform.

## Summary
- **Frontend**: Next.js + React
- **Backend**: Node.js + Express
- **Database**: MongoDB

## Prerequisites
- Node.js (16+)
- MongoDB running locally or accessible remotely

## Quick start

### Backend
1. `cd backend`
2. `npm install`
3. Create a `.env` file with at least:
   - `MONGO_URI` (e.g. `mongodb://127.0.0.1:27017/fix4ever_db`)
   - `JWT_SECRET`
   - `GMAIL_USER`
   - `GMAIL_PASS`
   - `GEMINI_API_KEY`
4. Start:
   - Production: `node index.js`
   - Development: `npx nodemon index.js`

### Frontend
1. `cd frontend`
2. `npm install`
3. Create a `.env.local` (or set env) with:
   - `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:5000`)
4. Start development:
   - `npm run dev`
5. Build / production:
   - `npm run build`
   - `npm start`

## Notes
- Ensure backend API and MongoDB are running before using frontend features (vendor onboarding, OTP, realtime).


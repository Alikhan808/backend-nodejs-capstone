# SecondChance

IBM JavaScript Back-end Capstone, implemented by Alikhan808 from the IBM template.

## Run

Use Node.js 22 or newer. Install dependencies with `npm ci` in the root, `secondChance-backend`, `secondChance-frontend`, and `sentiment`. Run `npm run build` and `npm start` from the root. Open http://localhost:3060.

The default demonstration uses a real temporary MongoDB server, seeded with 16 documents. Set MONGO_URL and MONGO_DB to use persistent MongoDB. Set JWT_SECRET to a private random secret for a persistent deployment. Never commit .env or secrets.

`npm test` checks seeded items, category search, registration, login, profile updates, authenticated uploads/deletion, and sentiment analysis. The GitHub Actions workflow repeats the checks and builds a downloadable frontend artifact.

## Source and attribution

- Official Apache-2.0 template: https://github.com/ibm-developer-skills-network/kjriu-backend-nodejs-capstone
- Sample item photographs: public SecondChance training implementation at https://github.com/shangesh-tech/backend-nodejs-capstone/tree/main/secondChance-backend/public/images

A temporary Cloudflare demonstration URL only works while its local process is running. The in-memory demonstration database is reset when the app restarts; use persistent MongoDB for long-term hosting.

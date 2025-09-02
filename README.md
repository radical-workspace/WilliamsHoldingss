# WilliamsHoldings Banking

Manual funding and withdrawals with Next.js + Prisma (SQLite). No on-chain/API integration; admins approve/reject after doing actions off-chain.

Quick start:

1. Copy `.env.example` to `.env` and set ADMIN_SECRET and RECEIVING_ADDRESSES.
2. Install and migrate:
	- npm install
	- npx prisma migrate dev --name init
3. Run dev server:
	- npm run dev

Auth:
- Users: Sign up at /register, sign in at /login; a cookie `userEmail` is set.
- Admin: Visit /admin/login and enter ADMIN_SECRET; sets `admin=1` cookie. Or send X-Admin-Secret header on requests.

Flows:
- Deposits: User sees receiving addresses at /deposits/new; submits a deposit record. Admin approves at /admin/deposits, which credits balance and writes a ledger entry.
- Withdrawals: User requests at /withdrawals/new (client validates address/amount). Funds are locked. Admin approves at /admin/withdrawals (after sending funds off-chain) which releases locked funds and writes ledger; reject will unlock.


Manual flow (no blockchain/API): users submit deposits/withdrawals; admins verify off-chain and approve.

## Setup

1. Copy env and edit values:

```
cp .env.example .env
```

2. Install and migrate:

```
npm install
npx prisma generate
npx prisma migrate dev --name init
```

3. Run:

```
npm run dev
```

Open http://localhost:3000

Admin pages require header `X-Admin-Secret: <ADMIN_SECRET>`. In a browser, use an extension to add the header or test with curl.

Receiving addresses are configured via `RECEIVING_ADDRESSES` env var: `ASSET:network:address` entries, comma-separated.

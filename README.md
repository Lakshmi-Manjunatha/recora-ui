# Recora UI

Recora helps people organise everyday receipts, find past purchases, and understand where their money goes. This repository contains the frontend, built with React, TypeScript, and Vite.

## Why Recora?

Receipts end up in wallets, email inboxes, and camera rolls. That makes it easy to lose track of what you bought, hard to find proof of purchase for a return, and time-consuming to work out how much you spent last month.

Recora brings receipts and spending insights into one place. You can find a purchase by merchant, review what you bought, and see how spending adds up across categories, merchants, and months.

## Features

- **Receipts** shows spending totals and receipt details when data is supplied. Search by merchant or category, filter by category or current month, and sort by date or amount. The upload dialog validates PDF, JPEG, and PNG files.
- **Insights** shows total spending, current-month spending, average receipt value, and receipt count. Date and category filters update the summaries and the breakdowns by category, month, and merchant. Amounts are calculated in pence and displayed in GBP.

## Backend status

Sign-in and registration are placeholder forms. Receipts and Insights show empty states when no data is supplied. The future Spring Boot integration will provide authentication, saved receipts, receipt uploads, and access to original files. Insights accepts typed receipt data, loading and error states, and optional verified nutrition and retailer pricing data. Test fixtures are used only in automated tests.

## Local development

Use Node.js 22.22.2 or a newer 22.x release to match the Node.js line used in CI.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite and select **Receipts** or **Insights** in the sidebar. Both pages open directly on the development server. In a production build, signed-out visitors see the sign-in dialog.

## Project commands

| Command                | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `npm run lint`         | Run ESLint.                                     |
| `npm test`             | Run the Vitest suite once.                      |
| `npm run format:check` | Check formatting with Prettier.                 |
| `npm run format`       | Apply Prettier formatting.                      |
| `npm run build`        | Type-check and build the app into `dist/`.      |
| `npm run preview`      | Serve the production build locally after build. |

GitHub Actions runs the formatting check, lint, tests, and build on pull requests and pushes to `main`.

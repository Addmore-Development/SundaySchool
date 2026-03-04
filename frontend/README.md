# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Project Structure

```
sunday-school-portal/                  ← root folder (git repo)
├── backend/                           ← Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/                    ← env, database, logger, etc.
│   │   │   ├── database.ts
│   │   │   ├── env.ts
│   │   │   └── index.ts
│   │   ├── controllers/               ← request handlers (business logic light)
│   │   │   ├── auth.controller.ts
│   │   │   ├── child.controller.ts
│   │   │   ├── attendance.controller.ts
│   │   │   ├── feeding.controller.ts
│   │   │   ├── welfare.controller.ts
│   │   │   └── report.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts       ← JWT / role checks
│   │   │   ├── error.middleware.ts
│   │   │   └── validate.middleware.ts   ← zod or express-validator
│   │   ├── models/                      ← Mongoose schemas or Prisma models
│   │   │   ├── User.ts
│   │   │   ├── Child.ts
│   │   │   ├── Family.ts
│   │   │   ├── Attendance.ts
│   │   │   ├── Feeding.ts
│   │   │   └── WelfareConcern.ts
│   │   ├── routes/                      ← express.Router() definitions
│   │   │   ├── auth.routes.ts
│   │   │   ├── child.routes.ts
│   │   │   ├── attendance.routes.ts
│   │   │   └── index.ts                 ← combine all
│   │   ├── services/                    ← business logic + DB calls
│   │   │   ├── auth.service.ts
│   │   │   ├── child.service.ts
│   │   │   ├── attendance.service.ts
│   │   │   ├── notification.service.ts  ← SMS/WhatsApp stub
│   │   │   └── report.service.ts
│   │   ├── types/                       ← shared DTO / response types
│   │   │   ├── auth.types.ts
│   │   │   ├── child.types.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── helpers.ts
│   │   └── server.ts                    ← entry point (or index.ts)
│   ├── tests/                           ← jest / vitest
│   ├── .env
│   ├── .env.example
│   ├── tsconfig.json
│   ├── package.json
│   └── tsconfig.build.json              (optional)
│
├── frontend/                          ← your existing Vite + React + TS app
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── api/                       ← axios / fetch clients + typed endpoints
│   │   │   ├── client.ts
│   │   │   ├── auth.api.ts
│   │   │   ├── child.api.ts
│   │   │   └── attendance.api.ts
│   │   ├── components/                ← reusable UI pieces
│   │   │   ├── ui/                    ← atoms / molecules (Button, Input, Card, Modal…)
│   │   │   ├── layout/                ← Header, Sidebar, Footer
│   │   │   ├── forms/                 ← RegistrationForm, ChildForm, ConsentForm
│   │   │   └── attendance/
│   │   ├── contexts/                  ← React Context (if not using Zustand/Redux)
│   │   │   └── AuthContext.tsx
│   │   ├── features/                  ← feature-based (recommended for larger app)
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── dashboard/
│   │   │   ├── children/
│   │   │   │   ├── ChildList.tsx
│   │   │   │   ├── ChildProfile.tsx
│   │   │   │   └── ChildRegisterForm.tsx
│   │   │   ├── attendance/
│   │   │   ├── feeding/
│   │   │   └── welfare/
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useQueryChildren.ts
│   │   ├── lib/                       ← utilities, formatters, constants
│   │   ├── pages/                     ← if using React Router page components
│   │   ├── routes/                    ← router config (AppRoutes.tsx)
│   │   ├── stores/                    ← Zustand / Jotai stores (preferred over Context)
│   │   ├── types/                     ← shared frontend types (can share with backend later)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .eslintrc.cjs                  (or eslint.config.js)
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── vite.config.ts
│   └── package.json
│
├── docs/                              ← architecture decision records, scope, wireframes
│   ├── adr/
│   └── images/
│
├── .gitignore
├── docker-compose.yml                 (optional – for local dev with mongo/postgres)
├── README.md
└── package.json                       (root – can be minimal or used for monorepo scripts)
```

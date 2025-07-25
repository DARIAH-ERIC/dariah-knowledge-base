# dariah knowledge base

application for key performance indicators.

## how to run

prerequisites:

- [node.js v22](https://nodejs.org/en/download)
- [pnpm v10](https://pnpm.io/installation)

> [!TIP]
>
> you can use `pnpm` to install the required node.js version with `pnpm env use 22 --global`

set required environment variables in `.env.local`:

```bash
cp .env.local.example .env.local
```

adjust environment variables in `.github/workflows/validate.yml` and
`.github/workflows/build-deploy.yml`.

install dependencies:

```bash
pnpm install
```

run a development server on [http://localhost:3000](http://localhost:3000):

```bash
pnpm run dev
```

## data model

inspect the data model as [prisma schema](./prisma/schema.prisma) or
[svg diagram](./public/assets/content/documentation/data-model/data-model.svg).

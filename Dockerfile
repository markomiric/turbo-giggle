FROM node:20-slim AS base

RUN apt-get update -y && apt-get install -y openssl && apt-get clean

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

USER node
WORKDIR /usr/src/app
COPY --chown=node:node . .

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/dist /usr/src/app/dist

RUN pnpm exec prisma generate
RUN pnpm exec prisma migrate deploy

CMD [ "node", "./dist/index.js" ]
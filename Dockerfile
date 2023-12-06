FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY . /usr/src/app
WORKDIR /usr/src/app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ARG PORT=5000
ENV PORT $PORT

RUN apt-get update -y && apt-get install -y openssl && apt-get clean

WORKDIR /opt/app

COPY --from=prod-deps /usr/src/app/node_modules /opt/app/node_modules
COPY --from=build /usr/src/app/dist /opt/app/dist

#TODO Need to be root to generate prisma client, it's not a good idea to run the app as root, investigate how to do it without root
# USER node
# COPY --chown=node:node . .
COPY . .

RUN pnpm exec prisma generate

CMD [ "node", "./dist/index.js" ]
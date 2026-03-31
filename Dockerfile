FROM oven/bun:1 AS deps
WORKDIR /app
ENV NODE_ENV=production

COPY package.json bun.lock turbo.json ./
COPY packages ./packages

RUN --mount=type=cache,target=/root/.bun \
  bun install


FROM oven/bun:1 AS build
WORKDIR /app
ENV NODE_ENV=production

# Vite env for Studio (baked at build-time)
ARG VITE_DATAHOUSE_DOMAIN=http://localhost:2510
ENV VITE_DATAHOUSE_DOMAIN=$VITE_DATAHOUSE_DOMAIN

COPY --from=deps /root/.bun /root/.bun
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock turbo.json ./
COPY packages ./packages

RUN bun run build


FROM oven/bun:1
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/packages /app/packages
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /root/.bun /root/.bun
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/bun.lock /app/bun.lock

EXPOSE 2510
EXPOSE 2511

ENTRYPOINT ["bun", "packages/datahouse/dist/cli.mjs"]
CMD ["--help"]


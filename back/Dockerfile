FROM oven/bun AS build

WORKDIR /app

COPY back/package.json package.json
COPY back/bun.lock bun.lock

RUN bun install

COPY back/src ./src
COPY back/drizzle ./drizzle

ENV NODE_ENV=production

RUN bun build \
    --compile \
		--minify-whitespace \
		--minify-syntax \
		--outfile server \
		src/index.ts

FROM oven/bun:slim

WORKDIR /app

COPY --from=build /app/server server
COPY --from=build /app/drizzle ./drizzle

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000

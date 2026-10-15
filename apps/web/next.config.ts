import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Os dados vêm do Supabase no cliente; validação só nas rotas que optarem via `instant`.
  experimental: {
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  devIndicators: { position: "bottom-right" },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

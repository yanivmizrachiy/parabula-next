/** @type {import("next").NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  output: isGithubPages ? "export" : undefined,
  images: {
    unoptimized: true
  },
  basePath: isGithubPages ? "/parabula-next" : "",
  assetPrefix: isGithubPages ? "/parabula-next/" : "",
};

module.exports = nextConfig;

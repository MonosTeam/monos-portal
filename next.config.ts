import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Private founding-client invite page (master copy: outreach/landing-page/founding-client.html in Project files).
  async rewrites() {
    return [{ source: "/founding-client", destination: "/founding-client.html" }];
  },
  async headers() {
    return ["/founding-client", "/founding-client.html", "/book"].map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Private festive-offer invite page (master copy: outreach/landing-page/festive-offer.html in Project files).
  async rewrites() {
    return [{ source: "/festive-offer", destination: "/festive-offer.html" }];
  },
  async headers() {
    return ["/festive-offer", "/festive-offer.html", "/book"].map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));
  },
};

export default nextConfig;

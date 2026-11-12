import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Private festive-offer invite page (master copy: outreach/landing-page/festive-offer.html in Project files).
  async rewrites() {
    return [
      { source: "/festive-offer", destination: "/festive-offer.html" },
      // Book a 1-1 with Aisha (built from marketing-site/_src/book.py by scripts/build-book-pages.py)
      { source: "/book-aisha", destination: "/book-aisha.html" },
      { source: "/book-aisha-clients", destination: "/book-aisha-clients.html" },
      { source: "/book-aisha-confirmed", destination: "/book-aisha-confirmed.html" },
    ];
  },
  async headers() {
    return ["/festive-offer", "/festive-offer.html", "/festive-assets/:path*", "/ig-media/:path*", "/book", "/book-aisha-clients", "/book-aisha-clients.html", "/book-aisha-confirmed", "/book-aisha-confirmed.html"].map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));
  },
};

export default nextConfig;

// The packages MONOS sells. Retail is the public price; offer packages are only bookable with a private offer code.
export type PackageId = "retail" | "launch490";

export type Package = {
  id: PackageId;
  name: string;
  pricePence: number;
  depositPct: number; // share due on booking; the rest is due on delivery
  revisions: number;
  pages: string[] | null; // fixed page list, or null when the client chooses (up to 5)
  extras: string[];
  inviteOnly: boolean;
  stages: { name: string; day: number; note?: string }[]; // day = day of the 7-day build it's due
  briefSections: string[];
};

export const PACKAGES: Record<PackageId, Package> = {
  retail: {
    id: "retail",
    name: "Website: 7-day build",
    pricePence: 100000,
    depositPct: 50,
    revisions: 2,
    pages: null,
    extras: [],
    inviteOnly: false,
    stages: [
      { name: "Discovery", day: 1 },
      { name: "Design", day: 2 },
      { name: "Build", day: 5 },
      { name: "Review", day: 6, note: "Up to 2 rounds of revisions" },
      { name: "Launch", day: 7 },
    ],
    briefSections: ["business", "pages", "style", "content", "domain"],
  },
  launch490: {
    id: "launch490",
    name: "Exclusive launch offer: 5-page website",
    pricePence: 49000,
    depositPct: 75,
    revisions: 1,
    pages: ["Home", "About", "Services", "Gallery", "Contact"],
    extras: ["30-minute 1-1 with Aisha", "Connection to your existing domain"],
    inviteOnly: true,
    stages: [
      { name: "1-1 with Aisha", day: 1, note: "30-minute call to plan your site" },
      { name: "Design", day: 2 },
      { name: "Build", day: 5 },
      { name: "Review", day: 6, note: "1 round of revisions included" },
      { name: "Launch", day: 7, note: "Connected to your existing domain" },
    ],
    briefSections: ["business", "fixed_pages", "style", "content", "domain"],
  },
};

export const SALES_TARGET = { count: 20, deadline: "2026-11-15" };

export const depositPence = (p: Package) => Math.round((p.pricePence * p.depositPct) / 100);

// Optional default payment links per package, set in the environment, e.g. PAY_LINK_LAUNCH490_DEPOSIT.
export const payLink = (p: Package, kind: "DEPOSIT" | "BALANCE") =>
  process.env[`PAY_LINK_${p.id.toUpperCase()}_${kind}`] || null;

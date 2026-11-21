import aboutPhoto from "@/assets/about-rack.jpg.asset.json";

/**
 * Athenks site copy and contact details.
 * Edit anything in this file to change what the website says.
 */
export const siteConfig = {
  brand: {
    name: "Athenks",
    tagline: "Fit hai to hit hai.",
    owner: "Chail Singh",
  },

  contact: {
    // Replace with the real number, for example "+91 98300 12345"
    phoneDisplay: "+91 97487 15272",
    // Digits only with country code, for example "919830012345". Leave empty until known.
    phoneDigits: "919748715272",
    email: "chailsinghraj@gmail.com",
    location: "Kolkata, West Bengal",
    instagramHandle: "@athenksshirts",
    instagramUrl: "https://www.instagram.com/athenksshirts/",
  },

  home: {
    heroLine: "Direct wholesale shirts from our Kolkata factory. Your party rates, one tap away.",
    rulesTitle: "How ordering works",
    rules: [
      {
        title: "Minimum order is 1 set",
        body: "1 set is 9 pieces, one each in sizes 28 to 36. We do not take single piece orders.",
      },
      {
        title: "Bulk orders come in cartons",
        body: "1 carton is 30 sets, which is 270 pieces of the same design.",
      },
      {
        title: "Your GST number shows your rate",
        body: "Enter your GST number once to see your personal Athenks party rates on every design.",
      },
      {
        title: "Changes go through our staff",
        body: "Need changes to an order? Call Athenks staff directly. All billing is handled personally by our office.",
      },
    ],
  },

  footer: {
    line: "Direct shirt manufacturing from Kolkata.",
  },

  about: {
    // Replace with Chail Singh's photo later (upload it and put its URL here).
    photo: aboutPhoto.url as string,
    photoAlt: "Athenks Design 344 shirts on the rack in three colours",
    headline: "Built in Kolkata, stitched for long term trade.",
    sublines: ["Direct from our factory", "Wholesale only since day one"],
    body: [
      "Every Athenks shirt starts with cloth. Chail Singh visits mills and traders himself, checks every sample by hand and buys the fabric he trusts in bulk meters.",
      "That fabric goes straight to our own production unit in Kolkata, where it is cut and stitched into new designs. Fresh samples come out every week or every month.",
      "We sell only to wholesale parties. No middlemen, no retail counters. Each design is packed in sets of nine pieces across sizes 28 to 36, ready for your shop shelves.",
      "Our parties have stayed with us for years because the fit is right and the rate is fair. This catalog keeps that simple: your designs, your rate, your orders in one place.",
    ],
  },

  admin: {
    // Demo login for the staff panel. Change before sharing the link widely.
    username: "admin",
    password: "athenks",
  },
} as const;

export const phoneHref = (): string =>
  siteConfig.contact.phoneDigits
    ? `tel:+${siteConfig.contact.phoneDigits}`
    : `mailto:${siteConfig.contact.email}`;

export const whatsappHref = (): string =>
  siteConfig.contact.phoneDigits
    ? `https://wa.me/${siteConfig.contact.phoneDigits}`
    : `mailto:${siteConfig.contact.email}`;

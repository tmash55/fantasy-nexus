import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "Fantasy Nexus",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Fantasy Football ADP tool - Compare average draft positions across ESPN, Yahoo, Sleeper, and more. Find value picks and dominate your fantasy football draft.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "fantasynexus.io",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/", "/adp"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID as string,
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Fantasy Nexus Pro",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Win your league with the best tools in the business",
        // The price you want to display, the one user will be charged on Stripe.
        price: 9.99,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 14.99,
        // Mark as featured
        features: [
          {
            name: "NFL Projections",
          },
          { name: "Start/Sit Analysis" },
          { name: "ADP Calculator" },
          { name: "Roster Optimizer" },
        ],
      },
      {
        // Season Pass (one-time)
        priceId: process.env.NEXT_PUBLIC_STRIPE_SEASON_PASS_PRICE_ID as string,
        name: "Season Pass",
        description: "One-time access through the Super Bowl",
        price: 24.99,
        priceAnchor: 39.99,
        isFeatured: true,
        // Optional flag to identify season pass in UI
        // @ts-ignore - non-typed helper key for UI
        isSeasonPass: true,
        features: [
          { name: "Full Weekly Rankings" },
          { name: "Custom Scoring Filters" },
          { name: "Unlimited Start/Sit" },
          { name: "Vegas Insights" },
        ],
      },
      
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `Fantasy Nexus <noreply@resend.fantasynexus.io>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Tyler at Fantasy Nexus <tyler@fantasynexus.io>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "tyler@fantasynexus.io",
  },
  colors: {
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..)
    // Custom primary color for dark theme
    main: "#3b82f6",
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/sign-in",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/nfl/rankings",
  },
} as ConfigProps;

export default config;

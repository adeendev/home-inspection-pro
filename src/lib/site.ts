export const SITE = {
  name: "Accurate Home Report",
  tagline: "Homeowner-Verified Property Reports",
  phone: "(800) 555-0142",
  email: "hello@accuratehomereport.com",
  address: "Nationwide service · Verified visits in select metros",
};

export type Package = {
  id: "basic" | "premium" | "verified";
  name: string;
  price: number;
  priceLabel: string;
  popular?: boolean;
  delivery: string;
  blurb: string;
  features: string[];
};

export const PACKAGES: Package[] = [
  {
    id: "basic",
    name: "Basic",
    price: 399,
    priceLabel: "$399",
    delivery: "48–72 Hours",
    blurb: "The essentials—public records, ownership, and your verified disclosures in one polished PDF.",
    features: [
      "Property Profile",
      "Public Records Summary",
      "Ownership Information",
      "Property History",
      "Homeowner Disclosures",
      "Improvement Summary",
      "Professional PDF Report",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 899,
    priceLabel: "$899",
    popular: true,
    delivery: "48–72 Hours",
    blurb: "Our most-ordered report. Adds permits, risk indicators, and neighborhood context.",
    features: [
      "Everything in Basic",
      "Expanded Property Analysis",
      "Permit Review",
      "Property Risk Indicators",
      "Neighborhood Overview",
      "Enhanced Property Timeline",
      "Insurance Related Information",
      "Premium Report Formatting",
    ],
  },
  {
    id: "verified",
    name: "Verified",
    price: 2500,
    priceLabel: "From $2,500",
    delivery: "Contact for timeline",
    blurb: "A professional visit confirms condition with photo documentation. Availability varies by region.",
    features: [
      "Everything in Premium",
      "Professional Property Visit",
      "Property Verification",
      "Photo Documentation",
      "Exterior Review",
      "Interior Review",
      "Verified Property Condition Summary",
    ],
  },
];

export const FAQS = [
  {
    q: "Is this a home inspection?",
    a: "No. Accurate Home Report is a documentation service. We compile public records, third-party property data, and homeowner-supplied information into a professional report. We do not physically inspect or evaluate your property.",
  },
  {
    q: "Who is this report for?",
    a: "Homeowners and their authorized representatives. Common uses include personal records, family handoffs, refinance documentation prep, and insurance discussions. It is not a substitute for licensed inspections, appraisals, or legal advice.",
  },
  {
    q: "How long does delivery take?",
    a: "Basic and Premium reports are delivered digitally within 48 hours to 3 business days. Verified reports require scheduling a property visit—timing depends on your region.",
  },
  {
    q: "What information will I need to provide?",
    a: "After checkout you'll complete a guided questionnaire covering ownership, improvements, systems, and any known disclosures. Most homeowners finish it in 15–25 minutes.",
  },
  {
    q: "Is my information secure?",
    a: "Yes. Checkout is encrypted end-to-end. Personal data is stored on access-restricted infrastructure and is never sold. You can request deletion at any time.",
  },
  {
    q: "Can I get a refund?",
    a: "Reports are custom-prepared the moment payment clears. Because production begins immediately, orders are non-refundable once preparation has started.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Marisol Vega",
    role: "Homeowner, Austin TX",
    quote:
      "The Premium report read like something a private bank would commission. We used it for our refinance file and our underwriter actually said thank you.",
  },
  {
    name: "Daniel Brooks",
    role: "Homeowner, Naples FL",
    quote:
      "I ordered the Verified package before listing privately. The photo documentation and condition summary saved us two rounds of buyer questions.",
  },
  {
    name: "Priya Anand",
    role: "Homeowner, Bellevue WA",
    quote:
      "Clean process, beautiful PDF, and the analyst followed up to clarify two improvement dates. Worth every dollar for the peace of mind.",
  },
  {
    name: "Trevor Okonkwo",
    role: "Homeowner, Atlanta GA",
    quote:
      "I expected a database printout. I got a 38-page narrative report I'm proud to keep in our home binder.",
  },
];

export const SERVICE_AREAS = [
  "Austin, TX", "Dallas–Fort Worth, TX", "Houston, TX", "Phoenix, AZ",
  "Denver, CO", "Nashville, TN", "Atlanta, GA", "Charlotte, NC",
  "Raleigh, NC", "Tampa, FL", "Orlando, FL", "Miami, FL",
  "Naples, FL", "Bellevue, WA", "Seattle, WA", "Portland, OR",
  "San Diego, CA", "Los Angeles, CA", "Bay Area, CA", "Las Vegas, NV",
  "Boise, ID", "Salt Lake City, UT", "Minneapolis, MN", "Chicago, IL",
];

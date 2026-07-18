import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { WhyUs } from "@/components/site/WhyUs";
import { Process } from "@/components/site/Process";
import { Packages } from "@/components/site/Packages";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { ServiceArea } from "@/components/site/ServiceArea";
import { Contact } from "@/components/site/Contact";
import { FinalCTA } from "@/components/site/FinalCTA";
import { FAQS, PACKAGES, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accurate Home Report — Homeowner-Verified Property Reports",
  description:
    "Comprehensive homeowner-verified property reports combining public records, trusted data, and your disclosures—prepared by analysts into one professional PDF. Delivery in 48 hrs – 3 business days.",
  openGraph: {
    title: "Accurate Home Report — Homeowner-Verified Property Reports",
    description: "Professional, analyst-prepared property documentation reports. Order in minutes.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: SITE.name,
      email: SITE.email,
      telephone: SITE.phone,
    },
    {
      "@type": "Service",
      name: "Homeowner-Verified Property Reports",
      provider: { "@type": "Organization", name: SITE.name },
      areaServed: "United States",
      offers: PACKAGES.map((p) => ({
        "@type": "Offer",
        name: `${p.name} Report`,
        price: p.price,
        priceCurrency: "USD",
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main>
        <Hero />
        <About />
        <Packages />
        <Process />
        <WhyUs />
        <Testimonials />
        <ServiceArea />
        <FAQ />
        <Contact />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

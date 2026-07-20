import Link from "next/link";
import { SITE } from "@/lib/site";
import { LogoFull } from "@/components/ui/Logo";

export function SiteFooter() {
  return (
    <footer className="gradient-ink text-cream/85">
      <div className="container-x py-14 md:py-20">
        <div className="grid gap-8 md:grid-cols-4 md:gap-12">
          <div className="md:col-span-2">
            <LogoFull transparent={true} />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/65">
              A homeowner-verified property reporting service. Public records, third-party data, and
              your disclosures—assembled by analysts into one professional report.
            </p>
            <p className="mt-6 text-xs text-cream/55">
              Not a home inspection, appraisal, or real estate brokerage. Reports do not replace
              licensed professional advice.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm text-cream">Service</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="/#packages" className="hover:text-brass">
                  Packages
                </a>
              </li>
              <li>
                <a href="/#process" className="hover:text-brass">
                  How it works
                </a>
              </li>
              <li>
                <Link href="/sample-report" className="hover:text-brass">
                  Sample report
                </Link>
              </li>
              <li>
                <a href="/#faq" className="hover:text-brass">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm text-cream">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/75">
              <li>{SITE.phone}</li>
              <li>{SITE.email}</li>
              <li>{SITE.address}</li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-cream/15 pt-6 text-xs text-cream/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>
            <Link href="/privacy" className="hover:text-brass">
              Privacy
            </Link>
            {" · "}
            <Link href="/terms" className="hover:text-brass">
              Terms
            </Link>
            {" · "}
            <Link href="/disclosures" className="hover:text-brass">
              Disclosures
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

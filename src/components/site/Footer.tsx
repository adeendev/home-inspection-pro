import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="gradient-ink text-cream/85">
      <div className="container-x py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-md border border-cream/20 text-cream">
                <span className="font-display text-lg leading-none">A</span>
              </span>
              <span className="font-display text-lg text-cream">Accurate Home Report</span>
            </div>
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
          <p>Privacy · Terms · Disclosures</p>
        </div>
      </div>
    </footer>
  );
}

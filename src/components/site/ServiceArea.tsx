import { MapPin } from "lucide-react";
import { SERVICE_AREAS } from "@/lib/site";
import neighborhood from "@/assets/neighborhood.jpg";

export function ServiceArea() {
  return (
    <section className="container-x py-24 md:py-32">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-border shadow-elegant">
          <img
            src={neighborhood}
            alt="Aerial view of an upscale neighborhood"
            width={1600}
            height={1000}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl glass p-5">
            <p className="font-display text-2xl text-ink">Verified visits in 14+ metro areas</p>
            <p className="mt-1 text-sm text-muted-foreground">Documentation reports available nationwide.</p>
          </div>
        </div>
        <div>
          <span className="eyebrow">Service Area</span>
          <h2 className="mt-3 font-display text-4xl text-ink text-balance md:text-5xl">
            Documentation nationwide. Verified visits in select metros.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Don't see your area? Our analyst-prepared Basic and Premium documentation reports are available
            anywhere in the United States.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {SERVICE_AREAS.map((a) => (
              <li key={a} className="flex items-center gap-2 text-sm text-ink/85">
                <MapPin className="h-3.5 w-3.5 text-brass" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

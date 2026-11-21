import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/data/siteConfig";

export const Route = createFileRoute("/_store/about")({
  head: () => ({
    meta: [
      { title: "About Athenks · Shirt manufacturer in Kolkata" },
      {
        name: "description",
        content: "Athenks is a direct wholesale shirt manufacturer in Kolkata run by Chail Singh, from fabric sourcing to factory stitching.",
      },
      { property: "og:title", content: "About Athenks · Shirt manufacturer in Kolkata" },
      { property: "og:description", content: "From cloth meters to finished shirts, direct to wholesale parties." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  const a = siteConfig.about;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <div className="grid gap-12 md:grid-cols-[5fr_7fr] md:gap-16">
        <div className="overflow-hidden rounded-lg border border-border">
          <img src={a.photo} alt={a.photoAlt} className="aspect-[4/5] h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-end">
          <p className="eyebrow text-subtle-foreground">About Athenks</p>
          <h1 className="mt-6 heading-1">{a.headline}</h1>
          <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6">
            {a.sublines.map((s) => (
              <p key={s} className="eyebrow">
                {s}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-8 border-t border-border pt-12 md:mt-24 md:grid-cols-2 md:gap-16">
        {[a.body.slice(0, 2), a.body.slice(2)].map((col, i) => (
          <div key={i} className="flex flex-col gap-6">
            {col.map((para) => (
              <p key={para.slice(0, 24)} className="body-2 text-muted-foreground md:title-2 md:font-normal">
                {para}
              </p>
            ))}
          </div>
        ))}
      </div>

      <p className="mt-16 body-1">
        {siteConfig.brand.owner}, owner · {siteConfig.contact.location}
      </p>
    </div>
  );
}

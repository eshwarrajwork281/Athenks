import { createFileRoute, Link } from "@tanstack/react-router";
import heroShirt from "@/assets/hero-shirt.webp.asset.json";
import skyShirt from "@/assets/shirt-sky.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { useStoreUI } from "@/components/store/ui-context";
import { siteConfig } from "@/data/siteConfig";

export const Route = createFileRoute("/_store/")({
  head: () => ({
    meta: [
      { title: "Athenks · Direct wholesale shirts from Kolkata" },
      {
        name: "description",
        content:
          "Athenks shirt catalog for wholesale parties. Enter your GST number to see your party rate and order in sets or cartons.",
      },
      { property: "og:title", content: "Athenks · Direct wholesale shirts from Kolkata" },
      {
        property: "og:description",
        content: "See new Athenks designs, your private party rate and order in sets or cartons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { openParty } = useStoreUI();
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto flex min-h-[calc(100svh-64px)] max-w-7xl flex-col items-center justify-center px-4 py-12 md:min-h-[calc(100svh-80px)] md:px-8">
          <p className="eyebrow text-subtle-foreground">Wholesale no hello text only · Kolkata</p>

          <div className="relative mt-8 flex w-full items-center justify-center">
            <p
              aria-hidden="true"
              className="wordmark-hero pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center text-foreground"
            >
              ATHENKS
            </p>
            <img
              src={heroShirt.url}
              alt="Athenks grey check shirt, Design 345, on a wooden hanger"
              className="rise-in relative z-10 h-[46svh] max-h-[560px] min-h-[300px] w-auto object-contain"
            />
          </div>

          <p className="mt-8 max-w-md text-center body-2 text-muted-foreground">
            {siteConfig.home.heroLine}
          </p>

          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="flex-1">
              <Link to="/collection">See collection</Link>
            </Button>
            <Button variant="outline" size="lg" className="flex-1" onClick={() => openParty()}>
              Get started
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-[38%_minmax(0,1fr)] md:gap-16 md:px-8 md:py-24">
          <div className="overflow-hidden rounded-lg border border-border">
            <img
              src={skyShirt.url}
              alt="Athenks Design 344 shirt in sky blue window check"
              loading="lazy"
              className="aspect-[3/4] h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="eyebrow text-subtle-foreground">For wholesale parties</p>
            <h2 className="mt-4 heading-2">{siteConfig.home.rulesTitle}</h2>
            <ol className="mt-12 flex flex-col">
              {siteConfig.home.rules.map((rule, i) => (
                <li
                  key={rule.title}
                  className="grid grid-cols-[48px_minmax(0,1fr)] gap-4 border-t border-border py-6 md:grid-cols-[64px_minmax(0,1fr)]"
                >
                  <span className="mono-num title-2 text-subtle-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="title-1">{rule.title}</h3>
                    <p className="mt-2 body-2 text-muted-foreground">{rule.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
              {(
                [
                  ["1 set", "9 pcs"],
                  ["1 carton", "30 sets"],
                  ["1 carton", "270 pcs"],
                ] as const
              ).map(([a, b]) => (
                <div key={a + b} className="bg-background px-4 py-4">
                  <p className="mono-num caption-1 text-subtle-foreground">{a}</p>
                  <p className="mono-num title-2">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle } from "lucide-react";
import { phoneHref, siteConfig, whatsappHref } from "@/data/siteConfig";
import { LogoMark } from "./Logo";
import { NAV_LINKS } from "./SiteHeader";

export function SiteFooter() {
  const c = siteConfig.contact;
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 pt-16 md:px-8 md:pt-20">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1.2fr)] md:gap-16">
          <div className="flex flex-col items-start gap-6">
            <p className="heading-3 max-w-md">{siteConfig.footer.line}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={phoneHref()}
                className="press inline-flex h-12 items-center gap-2 rounded-full bg-primary-foreground px-5 button-md text-primary hover:bg-primary-foreground/90"
              >
                <Phone className="h-5 w-5" strokeWidth={1.5} />
                Call Athenks
              </a>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex h-12 items-center gap-2 rounded-full border border-canvas-50 px-5 button-md hover:border-primary-foreground hover:bg-canvas-10"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
                WhatsApp
              </a>
            </div>
          </div>

          <div aria-hidden="true" className="hidden bg-canvas-14 md:block" />

          <div className="grid gap-12 sm:grid-cols-2">
            <div>
              <p className="eyebrow text-canvas-50">Pages</p>
              <ul className="mt-4 flex flex-col">
                {NAV_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="press inline-flex h-12 items-center title-2 text-canvas-72 hover:text-primary-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-canvas-50">Contact</p>
              <ul className="mt-4 flex flex-col gap-4 body-2 text-canvas-72">
                <li>
                  <a href={phoneHref()} className="mono-num hover:text-primary-foreground">
                    {c.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${c.email}`} className="break-all hover:text-primary-foreground">
                    {c.email}
                  </a>
                </li>
                <li>{c.location}</li>
                <li>
                  <a
                    href={c.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary-foreground"
                  >
                    Instagram {c.instagramHandle}
                  </a>
                </li>
                <li>
                  <Link
                    to="/admin"
                    className="caption-1 text-canvas-50 underline underline-offset-4 hover:text-primary-foreground"
                  >
                    Staff / Admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-canvas-14 pt-8 md:mt-20">
          <div className="flex items-end gap-4 overflow-hidden md:gap-8">
            <LogoMark className="mb-2 h-12 shrink-0 sm:h-20 md:h-28" />
            <p aria-hidden="true" className="wordmark-footer select-none whitespace-nowrap">
              Athenks
            </p>
          </div>
          <div className="flex flex-col gap-2 py-8 caption-2 text-canvas-50 sm:flex-row sm:justify-between">
            <p>© {new Date().getFullYear()} Athenks, Kolkata. All rights reserved.</p>
            <p>{siteConfig.brand.tagline}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

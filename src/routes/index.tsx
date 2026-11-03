import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Halcyon Sound Lab — Immersive Sound, Living Light, Spatial Stories" },
      {
        name: "description",
        content:
          "We design installations where music, light and space move together — for museums, festivals and curious minds.",
      },
      { property: "og:title", content: "Halcyon Sound Lab" },
      {
        property: "og:description",
        content:
          "Immersive sound and light installations where music, light and space move together.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/** Words separated by spaces; "|" forces a line break. */
function Title({
  text,
  id,
  size,
  as: Tag = "h2",
}: {
  text: string;
  id: string;
  size: "lg" | "sm";
  as?: "h1" | "h2";
}) {
  let idx = 0;
  return (
    <Tag
      className={`title title-${size}${id === "hero" ? " played" : ""}`}
      data-title={id}
      aria-label={text.replace(/\|/g, "")}
    >
      {text.split(" ").map((word, wi) => {
        if (word === "|") return <span key={wi} className="lbreak" />;
        return (
          <span key={wi} className="word" aria-hidden="true">
            {[...word].map((ch, ci) => {
              const delay = idx++ * 15;
              return (
                <span
                  key={ci}
                  className="char"
                  style={{ transitionDelay: `${delay}ms`, animationDelay: `${delay}ms` }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M2 12h2M6 8v8M10 5v14M14 8v8M18 10v4M22 12h0" strokeLinecap="round" />
    </svg>
  );
}

function TopLabel({ group, children }: { group: string; children: ReactNode }) {
  return (
    <div className={`top-label-wrap rv${group === "hero" ? " is-visible" : ""}`} data-rv={group}>
      <span className="top-label">
        <span className="ring ring-soft" />
        <WaveIcon />
        {children}
      </span>
    </div>
  );
}

function Arrow() {
  return (
    <span className="btn-arrow">
      <span className="ring ring-static" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <path d="M7 17L17 7M17 7H7M17 7v10" />
      </svg>
    </span>
  );
}

const STATS = [
  {
    t: "Installations",
    s: "62",
    d: "Permanent and touring pieces in galleries, old train stations, rooftops and pine forests.",
  },
  {
    t: "Speakers tuned",
    s: "1,200+",
    d: "Every room is mapped by ear and by sensor, so sound settles exactly where it should.",
  },
  {
    t: "Cities visited",
    s: "38",
    d: "From small harbour towns to big cities, our shows travel in a single shipping crate.",
  },
];

function Index() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import("@/lib/halo-scene").then(({ initHaloScene }) => {
      if (cancelled || !rootRef.current) return;
      cleanup = initHaloScene(rootRef.current);
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className="halo-home" ref={rootRef}>
      <div id="webgl" aria-hidden="true" />
      <div id="glow" aria-hidden="true" />

      <main>
        {/* 1. Hero */}
        <section className="overlay hero" aria-label="Introduction">
          <TopLabel group="hero">Welcome to Halcyon Sound Lab</TopLabel>

          <div className="rv is-visible" data-rv="hero">
            <Title
              as="h1"
              id="hero"
              size="lg"
              text="Immersive Sound | Living Light | Spatial Stories"
            />
          </div>

          <p className="lead rv is-visible" data-rv="hero">
            We design installations where music, light and space move together — for museums,
            festivals and curious minds.
          </p>

          <div className="rv is-visible" data-rv="hero">
            <div className="btn-row">
              <Link className="btn-primary" to="/contact">
                <span className="ring ring-accent" />
                Plan a visit
                <Arrow />
              </Link>
              <Link className="btn-secondary" to="/contact">
                Say hello
              </Link>
            </div>
            <div className="btn-row btn-row-2">
              <Link className="btn-secondary" to="/contact">
                Visit the studio
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Stat cards */}
        <section className="overlay dna" id="dna" aria-label="Studio in numbers">
          {STATS.map((c) => (
            <div className="dna-card-slot" key={c.t}>
              <article className="dna-card">
                <p className="card-title">{c.t}</p>
                <p className="card-stat">{c.s}</p>
                <p className="lead">{c.d}</p>
              </article>
            </div>
          ))}
        </section>

        {/* 3. Wave */}
        <section className="overlay wave" aria-label="Feel the room">
          <div className="wave-left">
            <TopLabel group="wave">Feel the room</TopLabel>
            <div className="rv" data-rv="wave">
              <Title id="wave" size="sm" text="Every space has a sound waiting to be found" />
            </div>
          </div>
          <div className="wave-right">
            <p className="lead rv" data-rv="wave">
              Echoes in a stairwell. Wind across a courtyard. We listen first, then build light and
              music that make people stop, breathe and look up.
            </p>
            <div className="rv" data-rv="wave">
              <div className="btn-row">
                <Link className="btn-primary" to="/contact">
                  <span className="ring ring-accent" />
                  See installations
                  <Arrow />
                </Link>
                <Link className="btn-secondary" to="/contact">
                  Book a tour
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Galaxy */}
        <section className="overlay galaxy" aria-label="Our studio universe">
          <div className="galaxy-top">
            <TopLabel group="galaxy">Our studio universe</TopLabel>
            <div className="rv" data-rv="galaxy">
              <Title id="galaxy" size="lg" text="A night sky of ideas — always expanding" />
            </div>
          </div>
          <div className="galaxy-bot">
            <p className="lead rv" data-rv="galaxy">
              Composers, lighting designers, carpenters and coders share one big workshop. Every new
              piece starts as a sketch on the wall and ends as a place you can walk into.
            </p>
            <div className="rv" data-rv="galaxy">
              <div className="btn-row">
                <Link className="btn-primary" to="/contact">
                  <span className="ring ring-accent" />
                  Explore projects
                  <Arrow />
                </Link>
                <Link className="btn-secondary" to="/contact">
                  Meet the team
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Scroll driver — 14 screens of height produce the 0→1 progress */}
        <div className="spacer" aria-hidden="true" />
      </main>
    </div>
  );
}

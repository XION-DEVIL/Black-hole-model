import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Visit & Contact — Halcyon Sound Lab" },
      {
        name: "description",
        content:
          "Plan a visit to the Halcyon Sound Lab studio, book a tour or ask about bringing an installation to your space.",
      },
      { property: "og:title", content: "Visit & Contact — Halcyon Sound Lab" },
      {
        property: "og:description",
        content: "Plan a studio visit, book a tour or ask about an installation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="halo-page">
      <div className="backdrop" aria-hidden="true" />

      <header className="top">
        <Link className="brand" to="/">
          <img
            className="logo-mark"
            src={`${import.meta.env.BASE_URL}logo-mark.svg`}
            alt=""
            aria-hidden="true"
          />
          <span className="wordmark">
            Halcyon Sound Lab<small>Visit · Contact</small>
          </span>
        </Link>
        <Link className="back" to="/">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          Back to home
        </Link>
      </header>

      <main className="stage">
        <div className="panel">
          <p className="eyebrow">Come and listen</p>
          <h1>Visit the studio</h1>
          <p className="intro">
            Our workshop is open for guided listening sessions most weekends. Drop us a line to book
            a tour, or to talk about bringing an installation to your space.
          </p>

          <div className="grid">
            <div className="tile">
              <h2>Studio</h2>
              <p>
                12 Lantern Lane
                <br />
                Riverside Quarter
              </p>
            </div>
            <div className="tile">
              <h2>Open hours</h2>
              <p>
                Sat – Sun
                <br />
                11:00 – 18:00
              </p>
            </div>
            <div className="tile">
              <h2>Say hello</h2>
              <p>
                <span className="grad">hello@halcyon.example</span>
                <br />
                +00 000 000 000
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

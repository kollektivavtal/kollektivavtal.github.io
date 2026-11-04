import Link from "next/link";
import { Breadcrumbs } from "@svenskamodellen/components/Breadcrumb";
import { Container } from "@svenskamodellen/components/Container";
import { Main } from "@svenskamodellen/components/Main";
import { Section } from "@svenskamodellen/components/Section";
import { TopLevelHeading } from "@svenskamodellen/components/TopLevelHeading";
import { ThumbnailRow, ThumbnailRowList } from "@/components/ThumbnailCard";
import { getAvtalSlugs, parseAvtal } from "@/lib/avtal";

export const dynamic = "force-static";

export default async function Home() {
  const avtal = getAvtalSlugs()
    .map((slug) => parseAvtal(slug))
    .filter((item) => item.documents.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "sv"));

  return (
    <>
      <Breadcrumbs>
        {{
          "https://svenskamodellen.github.io/": "Svenska modellen",
          "/": "Kollektivavtal",
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-8 pb-8">
          <TopLevelHeading
            text="Kollektivavtalsarkivet"
            subtext="Gillar man kollektivavtal har man kommit rätt."
          />

          <div className="flex flex-col gap-6">
            <p className="max-w-prose body-text">
              Den här sidan är en del av webbprojektet{" "}
              <a
                className="text-link underline"
                href="https://svenskamodellen.github.io/"
              >
                Svenska Modellen
              </a>{" "}
              med målet att göra det enkelt att hitta och forska i kollektivavtal.
            </p>

            <p className="max-w-prose body-text">
              Sverige har ingen lagstadgad minimilön. Istället bygger vår arbetsmarknadsmodell på att villkoren förhandlas fram i kollektivavtal. När så mycket av arbetslivet regleras genom avtal mellan parterna måste avtalen vara tillgängliga för alla.
            </p>

            <p className="body-text max-w-prose">
              Har du tillgång till avtal?{" "}
              <Link className="text-link" href="/bidra">
                Hjälp till att bygga arkivet
              </Link>
              .
            </p>
          </div>

          <Section className="w-full overflow-visible">
            <ThumbnailRowList>
              {avtal.map((item) => {
                const latest = item.documents[0];
                const years = [...new Set(item.documents.map((document) => document.year))];
                return (
                  <ThumbnailRow
                    key={item.slug}
                    href={`/${item.slug}`}
                    src={latest.thumbnail}
                    title={item.name}
                    description={years.join(", ")}
                  />
                );
              })}
            </ThumbnailRowList>
          </Section>
        </Container>
      </Main>
    </>
  );
}

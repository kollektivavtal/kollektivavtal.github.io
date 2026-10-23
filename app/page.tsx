import { Breadcrumbs } from "@svenskamodellen/components/Breadcrumb";
import { Container } from "@svenskamodellen/components/Container";
import { Main } from "@svenskamodellen/components/Main";
import { Section } from "@svenskamodellen/components/Section";
import { TopLevelHeading } from "@svenskamodellen/components/TopLevelHeading";
import _ from "lodash";
import xml2js from "xml2js";
import nodeHtmlParser from "node-html-parser";

export const dynamic = 'force-static';
export const fetchCache = 'default-no-store';

const yearsWithDocuments = [
  "2026",
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
  "2016",
  "2015",
  "2014",
  "2013",
];

export default async function Home() {
  const years = await Promise.all(
    yearsWithDocuments.map(async (year) => {
      const url = `https://kollektivavtal.github.io/${year}/sitemap.xml`;
      const response = await fetch(url);
      const text = await response.text();
      const parser = new xml2js.Parser();
      const parsedXml = await parser.parseStringPromise(text);
      const agreements = parsedXml.urlset.url.map(
        (urlItem: { loc: string[]; lastmod: string[] }) => {
          return {
            year,
            slug: urlItem.loc[0].split("/").pop(),
            url: urlItem.loc[0],
            lastmod: urlItem.lastmod ? urlItem.lastmod[0] : null,
          };
        }
      );

      return {
        name: year,
        agreements,
      };
    })
  );

  const yearsWithFeaturedAgreements = await Promise.all(
    years.map(async (year) => {
      const featuredAgreements = await Promise.all(
        _.orderBy(year.agreements, ["lastmod"], ["desc"])
          .slice(0, 16)
          .map(async (agreement) => {
            const response = await fetch(agreement.url);
            const text = await response.text();
            const parsedHtml = nodeHtmlParser.parse(text)!;
            const title = parsedHtml.querySelector("title")!.text;
            const icon = parsedHtml.querySelector("img")?.getAttribute("src");
            return {
              title,
              url: agreement.url,
              icon: icon ? `https://kollektivavtal.github.io/${icon}` : null,
              lastmod: agreement.lastmod,
            };
          })
      );

      return {
        ...year,
        featuredAgreements,
      };
    })
  );

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

          <p className="body-text max-w-prose">
            Har du tillgång till avtal? <a className="text-link" href="/bidra">Hjälp till att bygga arkivet</a>. Saknas ett avtal här? Skicka det till{" "}
            <a className="text-link underline" href="mailto:henry@catalinismith.se">
              henry@catalinismith.se
            </a>
            .
          </p>

          <Section className="w-full overflow-visible">
            <div className="flex w-full flex-col gap-y-10">
              {yearsWithFeaturedAgreements.map((year) => (
                <section key={year.name} className="flex flex-col gap-y-5">
                  <div className="flex flex-col gap-y-0">
                    <a
                      className="section-heading text-link underline"
                      href={`/${year.name}`}
                    >
                      {year.name}
                    </a>
                    <span className="body-text text-slate-500 dark:text-slate-100">
                      {year.agreements.length} avtal
                    </span>
                  </div>
                  <div className="flex gap-x-4 overflow-x-auto -mx-2 px-2 pt-2 pb-4 pr-8 [scrollbar-width:thin] [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]">
                    {year.featuredAgreements.map((agreement) => (
                      <div
                        key={agreement.url}
                        className="group relative flex w-[190px] shrink-0 flex-col gap-y-2"
                      >
                        <div className="aspect-[707/1000] w-full overflow-hidden rounded-md bg-white shadow-md ring-1 ring-black/10 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:shadow-lg dark:ring-white/50 dark:ring-offset-2 dark:ring-offset-[var(--color-background)]">
                          {agreement.icon ? (
                            <img
                              alt=""
                              className="h-full w-full object-cover [image-rendering:pixelated]"
                              src={agreement.icon}
                            />
                          ) : (
                            <div className="h-full w-full bg-slate-100" />
                          )}
                        </div>
                        <a
                          className="block w-full min-w-0 text-link underline body-text [hyphens:auto] [hyphenate-limit-chars:3_1_1] [overflow-wrap:break-word] group-hover:underline after:absolute after:inset-0"
                          lang="sv"
                          href={agreement.url}
                        >
                          {agreement.title}
                        </a>
                      </div>
                    ))}
                    {year.agreements.length > year.featuredAgreements.length && (
                      <a
                        className="group flex w-[190px] shrink-0 flex-col gap-y-2"
                        href={`/${year.name}`}
                      >
                        <div className="flex aspect-[707/1000] w-full flex-col items-center justify-center gap-y-1 rounded-md border border-dashed border-slate-300 text-center transition-transform duration-150 group-hover:-translate-y-0.5">
                          <span className="font-bold text-link underline group-hover:underline">Se alla</span>
                          <span className="text-sm">
                            {`${year.agreements.length} avtal från ${year.name}`}
                          </span>
                        </div>
                      </a>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </Section>
        </Container>
      </Main>
    </>
  );
}

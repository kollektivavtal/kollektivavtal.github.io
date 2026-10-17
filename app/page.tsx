import { Breadcrumbs } from "@arbetsmarknad/components/Breadcrumb";
import { Container } from "@arbetsmarknad/components/Container";
import { Main } from "@arbetsmarknad/components/Main";
import { Section } from "@arbetsmarknad/components/Section";
import { TopLevelHeading } from "@arbetsmarknad/components/TopLevelHeading";
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
          "https://arbetsmarknad.github.io/": "Arbetsmarknad",
          "/": "Kollektivavtal",
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-8">
          <TopLevelHeading
            text="Kollektivavtalsarkivet"
            subtext="Gillar man kollektivavtal har man kommit rätt."
          />

          <div className="flex flex-col items-start space-y-2">
            <p>
              Skicka gärna saknade avtal till{" "}
              <a
                className="text-link underline"
                href="mailto:henry@catalinismith.se"
              >
                henry@catalinismith.se.
              </a>
            </p>
          </div>

          <Section className="w-full overflow-visible">
            <div className="flex w-full flex-col gap-y-10">
              {yearsWithFeaturedAgreements.map((year) => (
                <section key={year.name} className="flex flex-col gap-y-5">
                  <div className="flex flex-col gap-y-1">
                    <a
                      className="text-2xl font-bold text-link underline md:text-3xl"
                      href={`/${year.name}`}
                    >
                      {year.name}
                    </a>
                    <span className="text-base text-slate-500 dark:text-slate-100">
                      {year.agreements.length} avtal
                    </span>
                  </div>
                  <div className="flex gap-x-4 overflow-x-auto -mx-2 px-2 pt-2 pb-4 pr-8 [scrollbar-width:thin] [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]">
                    {year.featuredAgreements.map((agreement) => (
                      <a
                        key={agreement.url}
                        className="group flex w-40 shrink-0 flex-col gap-y-2"
                        href={agreement.url}
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
                        <span className="line-clamp-2 text-sm leading-5 group-hover:underline">
                          {agreement.title}
                        </span>
                      </a>
                    ))}
                    {year.agreements.length > year.featuredAgreements.length && (
                      <a
                        className="group flex w-40 shrink-0 flex-col gap-y-2"
                        href={`/${year.name}`}
                      >
                        <div className="flex aspect-[707/1000] w-full flex-col items-center justify-center gap-y-1 rounded-md border border-dashed border-slate-300 text-center transition-transform duration-150 group-hover:-translate-y-0.5">
                          <span className="font-bold text-link group-hover:underline">Se alla</span>
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

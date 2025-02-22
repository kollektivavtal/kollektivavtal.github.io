import { Breadcrumbs } from "@arbetsmarknad/components/Breadcrumb";
import {
  DescriptionList,
  DescriptionItem,
  DescriptionTerm,
  DescriptionDetails,
} from "@arbetsmarknad/components/DescriptionList";
import {
  DocumentList,
  DocumentItem,
  DocumentIcon,
  DocumentLink,
  DocumentDescription,
} from "@arbetsmarknad/components/DocumentList";
import { Container } from "@arbetsmarknad/components/Container";
import { Main } from "@arbetsmarknad/components/Main";
import { Section } from "@arbetsmarknad/components/Section";
import { SectionHeading } from "@arbetsmarknad/components/SectionHeading";
import { TopLevelHeading } from "@arbetsmarknad/components/TopLevelHeading";
import _ from "lodash";
import xml2js from "xml2js";
import nodeHtmlParser from "node-html-parser";

const yearsWithDocuments = [
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
      const url = `https://kollektivavtal.codeberg.page/${year}/sitemap.xml`;
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
        },
      );

      return {
        name: year,
        agreements,
      };
    }),
  );

  const agreementsInOrderOfMostRecent = _.flatten(
    years.map((year) => year.agreements),
  ).sort((a, b) => {
    return a.lastmod < b.lastmod ? 1 : -1;
  });

  const mostRecentAgreements = await Promise.all(
    agreementsInOrderOfMostRecent.slice(0, 3).map(async (agreement) => {
      const response = await fetch(agreement.url);
      const text = await response.text();
      const parsedHtml = nodeHtmlParser.parse(text)!;
      const title = parsedHtml.querySelector("title")!.text;
      const icon = parsedHtml.querySelector("img")?.getAttribute("src");
      return {
        title,
        url: agreement.url,
        icon: `https://kollektivavtal.codeberg.page/${icon}`,
        lastmod: agreement.lastmod,
      };
    }),
  );

  return (
    <>
      <Breadcrumbs>
        {{
          "https://arbetsmarknad.codeberg.page/": "Arbetsmarknad",
          "/": "Kollektivavtal",
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-8">
          <TopLevelHeading text="Kollektivavtalsarkivet" />

          <div className="flex flex-col items-start space-y-2">
            <p>Gillar man kollektivavtal har man kommit rätt.</p>
            <p>
              Skicka gärna saknade avtal till{" "}
              <a
                className="text-link underline"
                href="mailto:henry@catalinismith.com"
              >
                henry@catalinismith.com.
              </a>
            </p>
          </div>

          <Section>
            <SectionHeading>Senaste avtal</SectionHeading>
            <DocumentList>
              {mostRecentAgreements.map((agreement) => (
                <DocumentItem key={agreement.url}>
                  <DocumentIcon src={agreement.icon} />
                  <DocumentLink href={agreement.url}>
                    {agreement.title}
                  </DocumentLink>
                  <DocumentDescription>
                    {`Tillagd ${agreement.lastmod.split("T")[0]}`}
                  </DocumentDescription>
                </DocumentItem>
              ))}
            </DocumentList>
          </Section>

          <Section>
            <SectionHeading>År</SectionHeading>
            <DescriptionList>
              {years.map((year) => (
                <DescriptionItem key={year.name}>
                  <DescriptionTerm>
                    <a
                      className="font-bold underline text-link"
                      href={`/${year.name}`}
                    >
                      {year.name}
                    </a>
                  </DescriptionTerm>
                  <DescriptionDetails>{`${year.agreements.length} avtal`}</DescriptionDetails>
                </DescriptionItem>
              ))}
            </DescriptionList>
          </Section>
        </Container>
      </Main>
    </>
  );
}

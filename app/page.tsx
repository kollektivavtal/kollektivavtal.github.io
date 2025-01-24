import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@arbetsmarknad/components/Breadcrumb";
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
import { HeaderMenu } from "@arbetsmarknad/components/HeaderMenu";
import { Page } from "@arbetsmarknad/components/Page";
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
  "2018",
  "2017",
  "2016",
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
      const agreements = parsedXml.urlset.url.map((urlItem: any) => {
        return {
          year,
          slug: urlItem.loc[0].split("/").pop(),
          url: urlItem.loc[0],
          lastmod: urlItem.lastmod ? urlItem.lastmod[0] : null,
        };
      });

      return {
        name: year,
        agreements,
      };
    })
  );

  const agreementsInOrderOfMostRecent = _.flatten(
    years.map((year) => year.agreements)
  ).sort((a, b) => {
    return a.lastmod < b.lastmod ? 1 : -1;
  });

  const mostRecentAgreements = await Promise.all(
    agreementsInOrderOfMostRecent.slice(0, 3).map(async (agreement) => {
      const response = await fetch(agreement.url);
      const text = await response.text();
      const parsedHtml = nodeHtmlParser.parse(text)!;
      const title = parsedHtml.querySelector("title")!.text;
      const icon = parsedHtml
        .querySelector("link[rel='icon']")
        ?.getAttribute("href");
      return {
        title,
        url: agreement.url,
        icon: `https://kollektivavtal.github.io/${icon}`,
        lastmod: agreement.lastmod,
      };
    })
  );

  return (
    <Page>
      <HeaderMenu
        href="https://kollektivavtal.github.io"
        text="kollektivavtal.github.io"
      />
      <Breadcrumb className="py-4 w-full flex justify-center">
        <Container>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="https://arbetsmarknad.github.io/">
                Arbetsmarknad
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Kollektivavtal</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Container>
      </Breadcrumb>
      <main className="flex flex-col items-center w-full py-4">
        <Container className="flex flex-col items-start space-y-8">
          <TopLevelHeading text="Kollektivavtalsarkivet" />

          <div className="flex flex-col items-start space-y-2">
            <p>Gillar man kollektivavtal har man kommit rätt.</p>
            <p>
              Skicka gärna saknade avtal till{" "}
              <a
                className="text-blue-600 underline"
                href="mailto:henry@catalinismith.com"
              >
                henry@catalinismith.com.
              </a>
            </p>
          </div>

          <section className="flex flex-col items-start space-y-4">
            <h2 className="text-2xl font-bold">Senaste Avtal</h2>
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
          </section>

          <section className="flex flex-col items-start space-y-4">
            <h2 className="text-2xl font-bold">År</h2>
            <DescriptionList>
              {years.map((year) => (
                <DescriptionItem key={year.name}>
                  <DescriptionTerm>
                    <a
                      className="font-bold underline text-blue-600"
                      href={`/${year.name}`}
                    >
                      {year.name}
                    </a>
                  </DescriptionTerm>
                  <DescriptionDetails>{`${year.agreements.length} avtal`}</DescriptionDetails>
                </DescriptionItem>
              ))}
            </DescriptionList>
          </section>
        </Container>
      </main>
    </Page>
  );
}

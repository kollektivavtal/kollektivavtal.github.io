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

export default async function (eleventyConfig) {
  eleventyConfig.addGlobalData("site", {
    title: "Kollektivavtalsarkivet",
    description: "Gillar man kollektivavtal har man kommit rätt.",
  });

  const years = await Promise.all(
    yearsWithDocuments.map(async (year) => {
      const url = `https://kollektivavtal.github.io/${year}/sitemap.xml`;
      const response = await fetch(url);
      const text = await response.text();
      const parser = new xml2js.Parser();
      const parsedXml = await parser.parseStringPromise(text);
      const agreements = parsedXml.urlset.url.map((urlItem) => {
        return {
          year,
          slug: urlItem.loc[0].split("/").pop(),
          url: urlItem.loc[0],
          lastmod: urlItem.lastmod ? urlItem.lastmod[0] : null, // handle cases where lastmod is missing
        };
      });

      return {
        name: year,
        agreements,
      };
    }),
  );

  eleventyConfig.addCollection("years", async function () {
    return years;
  });

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
      const icon = parsedHtml
        .querySelector("link[rel='icon']")
        ?.getAttribute("href");
      return {
        title,
        url: agreement.url,
        icon: `https://kollektivavtal.github.io/${icon}`,
        lastmod: agreement.lastmod,
      };
    }),
  );

  eleventyConfig.addCollection("mostRecentAgreements", function () {
    return mostRecentAgreements;
  });
}

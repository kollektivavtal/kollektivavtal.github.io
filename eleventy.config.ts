const years = [
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

  eleventyConfig.addCollection("years", async function () {
    return Promise.all(
      years.map(async (year) => {
        const url = `https://kollektivavtal.github.io/${year}/sitemap.xml`;
        const response = await fetch(url);
        const text = await response.text();
        const agreementCount = (text.match(/<url>/g) || []).length;
        console.log(`Year ${year} has ${agreementCount} documents`);
        return {
          name: year,
          agreementCount,
        };
      }),
    );
  });
}

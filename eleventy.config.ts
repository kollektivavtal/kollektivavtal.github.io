export default async function (eleventyConfig) {
  eleventyConfig.addCollection("years", async function () {
    return Promise.all(
      ["2024", "2023", "2021", "2020", "2017"].map(async (year) => {
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

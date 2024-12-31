import { copyFile } from 'node:fs/promises';

export default async function(eleventyConfig) {
  eleventyConfig.on(
		"eleventy.after",
		async ({ dir, results, runMode, outputMode }) => {
      await copyFile("_site/sv.html", "_site/index.html")
		}
	)
}

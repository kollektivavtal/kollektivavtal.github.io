import path from 'path'
import * as sass from 'sass'

export default async function(eleventyConfig) {
  eleventyConfig.addTemplateFormats('scss')
  eleventyConfig.addExtension('scss', {
    outputFileExtension: 'css',
    compile(content, inputPath) {
      let parsed = path.parse(inputPath)
      if (parsed.name.startsWith('_')) return

      console.log('🔮 compiling scss...', inputPath)

      return (data) => {
        let result = sass.compile(inputPath)
        return result.css
      }
    },
  })
}

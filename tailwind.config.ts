import type { Config } from 'tailwindcss'

export default {
  content: ["./index.njk", "./_includes/*.njk"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config

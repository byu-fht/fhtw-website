/** @type {import('tailwindcss').Config} */

// const colors = require("tailwindcss/colors");

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		transparent: "transparent",
		current: "currentColor",
		
		/*colors: {
			transparent: "transparent",
			current: "currentColor",
			default: "#1a202c",
			byu: "#002e5d",
			red: "#990011",
			lightblue: "#3182ce",
			yellow: "#ffcd00",
			bluey: "#182b49",
			/*blue: colors.blue,
			sky: colors.sky,
			slate: colors.slate,
			gray: colors.gray,
			white: colors.white,
			neutral: colors.neutral,
			black: colors.black,
			orange: colors.orange,
			green: colors.green,
			purple: colors.purple,
			cyan: colors.cyan,
			syk: colors.sky,
		  },*/
		  extend: {
			fontFamily: {
			  arvo: ['"Arvo"', "sans-serif"],
			  gothic: ['"Gothic A1"', "sans-serif"]
			},
		},
	},
	plugins: [],
}

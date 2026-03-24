/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				mainBlue: "#3966ef",
				bgGrey: "#f6f6f8",
			},
		},
	},
	plugins: [],
};

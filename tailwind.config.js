/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				mainBlue: "#3966ef",
				bgGrey: "#f6f6f8",
				primary: '#5140E8',
				secondary: '#15AA96',
				Tertiary: '#ED4181',
				Neutral: '#63677E',
			},
			fontFamily:{
				sans: ['Cairo_400Regular'],
				semibold: ['Cairo_600SemiBold'],
				bold: ['Cairo_700Bold'],
			}
		},
	},
	plugins: [],
};

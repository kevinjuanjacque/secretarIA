import { transform } from 'typescript';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'primary': '#d494ff',
				'secondary': 'hsl(173, 81%, 68%)',
				'dark100': 'hsl(240, 4%, 9%);'
			},
			backgroundImage: {
				'mix': 'linear-gradient(315deg,hsl(276, 79%, 69%) 25%,hsl(173, 75%, 47%))',
			},
			keyframes: {
				pulseCustom: {
				  '0%, 100%': { transform: 'scale(1)' },
				  '50%': { transform: 'scale(1.3)' },
				},
				redPulse: {
					'0%, 100%': { backgroundColor: '#ff7f7f' }, // Rojo claro
					'50%': { backgroundColor: '#b30000' }, // Rojo oscuro
				  },
			  },
			  animation: {
				pulseCustom: 'pulseCustom 1s ease-in-out infinite',
				redPulse: 'redPulse 2s ease-in-out infinite',
			  },
		},
	},
	plugins: [],
}

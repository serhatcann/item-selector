/** @type {import('tailwindcss').Config} */
export const content = [
  "./src/**/*.{html,ts}",
];
export const theme = {
  extend: {
    colors: {
      surface: 'hsl(0, 0%, 100%)',
      hover: 'hsl(0, 0%, 96%)',
      text: 'hsl(195, 3%, 24%)',
      border: 'hsl(210, 0%, 89%)',
      primary: 'hsl(213, 97%, 53%)',
    },
    spacing: {
      default: '16px',
    },
    fontSize: {
      default: '14px',
    },
    borderRadius: {
      default: '3px',
    },
  },
};
export const plugins = [];

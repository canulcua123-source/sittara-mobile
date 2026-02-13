/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#1f7a66", // Verde Jade (Yucatán)
                secondary: "#c45037", // Terracota
                accent: "#c45037",
                background: "#f5f2ed", // Arena claro
                foreground: "#2e2e2e", // Gris oscuro
                "primary-orange": "#1f7a66", // Mantener alias por ahora si es necesario
            },
        },
    },
    plugins: [],
};

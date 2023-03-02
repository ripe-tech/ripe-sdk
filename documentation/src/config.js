import { defineUserConfig, defaultTheme } from "vuepress"

export default defineUserConfig({
    title: "RIPE SDK - Client Side Rendering",
    description: "Documentation for RIPE SDK",
    lang: "en-US",
    theme: defaultTheme({
        logo: '/images/logo.svg',
        contributors: false,
        lastUpdated: false
    })
})

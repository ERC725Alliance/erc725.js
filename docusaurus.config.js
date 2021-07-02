module.exports = {
    title: 'erc725.js',
    baseUrl: '/',
    url: 'http://docs.lukso.network',
    onBrokenLinks: 'log',
    plugins: [
        [
            'docusaurus-plugin-typedoc',

            // Plugin / TypeDoc options
            {
                entryPoints: ['./src/index.ts'],
                tsconfig: './tsconfig.json',
                watch: process.env.TYPEDOC_WATCH,
                excludeInternal: true,
                readme: 'none',
                out: 'erc725js',
                includeVersion: true,
                sort: 'source-order',
                sidebar: {
                    categoryLabel: 'erc725.js'
                }
            }
        ]
    ],
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                readme: 'none',
                docs: {
                    routeBasePath: '/',
                    editUrl: 'https://github.com/lukso-network/docs-website/tree/main/'
                }
            }
        ]
    ]
}

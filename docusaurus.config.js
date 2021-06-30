module.exports = {
    title: 'erc725.js',
    baseUrl: '/',
    url: 'http://docs.lukso.network',
    plugins: [
        [
            'docusaurus-plugin-typedoc',

            // Plugin / TypeDoc options
            {
                entryPoints: ['./src/index.ts'],
                tsconfig: './tsconfig.json'
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
                    editUrl:
                'https://github.com/lukso-network/docs-website/tree/main/'
                }
            }
        ]
    ]
}

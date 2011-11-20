({
    block: 'b-page',
    title: 'Simple chart',
    head: [
        { elem: 'css', url: 'simple-chart.css'},
        { elem: 'css', url: 'simple-chart.ie.css', ie: 'lt IE 8' },
        { block: 'i-jquery', elem: 'core' },
        { elem: 'js', url: 'simple-chart.bemhtml.js' },
        { elem: 'js', url: 'simple-chart.js' }
    ],
    content: [
        {
            block: 'b-text',
            elem: 'h1',
            content: 'Simple chart'
        },
        {
            block: 'b-chart',
            title: 'Loading...',
            settingsProvider: {
                name: 'b-chart__static-settings-provider',
                title: 'Simple chart',
                yAxes: [
                    {
                        pos: 'left',
                        scale: 'b-scale__linear',
                        range: {
                            from: 0.0,
                            to: 10.0
                        },
                        content: ["left1"]
                    },
                    { pos: 'right', content: ["right1"] },
                    { pos: 'left', content: ["left2"] }
                ],
            }
        }
    ]
})

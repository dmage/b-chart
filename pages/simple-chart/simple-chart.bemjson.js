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
                xAxes: [
                    {
                        pos: 'bottom',
                        scale: 'b-scale__linear',
                        rangeProvider: {
                            name: 'i-time-range-provider',
                            period: 50,
                            updateInterval: 10000
                        }
                    },
                    {
                        pos: 'top',
                        scale: 'b-scale__linear',
                        rangeProvider: {
                            name: 'b-chart__static-range-provider',
                            min: 0,
                            max: 180
                        }
                    }
                ],
                yAxes: [
                    {
                        pos: 'left',
                        scale: 'b-scale__linear',
                        rangeProvider: {
                            name: 'b-chart__static-range-provider',
                            min: 0,
                            max: 4/3
                        },
                        filters: [
                            { name: 'b-chart-processor__stacked' }
                        ]
                    },
                    {
                        pos: 'right',
                        rangeProvider: {
                            name: 'b-chart__static-range-provider',
                            min: -1,
                            max: 1
                        },
                    },
                ],
                items: [
                    {
                        name: 'sin(x)',
                        xAxis: 0,
                        yAxis: 0,
                        color: 'rgba(50,200,50,0.7)',
                        dataProvider: {
                            name: 'i-math-data-provider',
                            func: 'sin2',
                            step: 0.005
                        },
                        filters: [
                            {
                                name: 'b-chart-filter__threshold',
                                min: 0,
                                max: 2/3
                            }
                        ]
                    },
                    {
                        name: 'cos(x)',
                        xAxis: 0,
                        yAxis: 0,
                        color: '#339',
                        dataProvider: {
                            name: 'i-math-data-provider',
                            func: 'cos2',
                            step: 0.005
                        }
                    },
                    {
                        name: 'sin(x), axis #2',
                        xAxis: 1,
                        yAxis: 1,
                        color: 'rgba(240,50,50,0.2)',
                        dataProvider: {
                            name: 'i-math-data-provider',
                            func: 'sin',
                            step: 0.5
                        }
                    }
                ],
                overlays: [
                    { name: 'b-chart-overlay__grid' },
                    { name: 'b-chart-overlay__render' }
                ]
            }
        }
    ]
})

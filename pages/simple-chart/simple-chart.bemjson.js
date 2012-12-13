({
    block: 'b-page',
    title: 'Simple chart',
    head: [
        { elem: 'css', url: '_simple-chart.css'},
        { elem: 'css', url: '_simple-chart.ie.css', ie: 'lt IE 8' },
        { block: 'i-jquery', elem: 'core' },
        { elem: 'js', url: '_simple-chart.bemhtml.js' },
        { elem: 'js', url: '_simple-chart.js' }
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
                            period: 60,
                            updateInterval: 10000
                        },
                        units: "unixtime"
                    },
                    {
                        pos: 'top',
                        scale: 'b-scale__linear',
                        rangeProvider: {
                            name: 'b-chart__static-range-provider',
                            min: 0,
                            max: 80
                        }
                    }
                ],
                yAxes: [
                    {
                        pos: 'left',
                        scale: 'b-scale__linear',
                        rangeProvider: {
                            name: 'b-chart__data-range-provider',
                            minSliceName: ''
                        },
                        processors: [
                            { name: 'b-chart-processor__stacked' }
                        ]
                    },
                    {
                        pos: 'left',
                        scale: 'b-scale__linear',
                        rangeProvider: {
                            name: 'b-chart__static-range-provider',
                            min: 0,
                            max: 4/3
                        }
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
                        name: 'sin(x), axis #3',
                        xAxis: 1,
                        yAxis: 2,
                        color: 'rgba(220,220,220,0.4)',
                        dataProvider: {
                            name: 'i-math-data-provider',
                            func: 'sin',
                            step: 0.01
                        }
                    },
                    {
                        name: 'sin(x)',
                        xAxis: 0,
                        yAxis: 1,
                        color: '#ff6',
                        dataProvider: {
                            name: 'i-math-data-provider',
                            func: 'sin2',
                            step: 0.01
                        }
                    },
                    {
                        name: 'cos(x)',
                        xAxis: 0,
                        yAxis: 1,
                        color: '#6f6',
                        dataProvider: {
                            name: 'i-math-data-provider',
                            func: 'cos2',
                            step: 0.01
                        }
                    },
                    {
                        name: 'sin(x)',
                        xAxis: 0,
                        yAxis: 0,
                        color: '#cc6',
                        dataProvider: {
                            name: 'i-math-data-provider',
                            func: 'sin2',
                            step: 0.001
                        },
                        filters: [
                            {
                                name: 'b-chart-filter__threshold',
                                min: 1/3,
                                max: 15/16
                            }
                        ]
                    },
                    {
                        name: 'cos(x)',
                        xAxis: 0,
                        yAxis: 0,
                        color: '#6c6',
                        dataProvider: {
                            name: 'i-math-data-provider',
                            func: 'cos2',
                            step: 0.001
                        },
                        filters: [
                            {
                                name: 'b-chart-filter__threshold',
                                min: 0,
                                max: 5/6
                            }
                        ]
                    }
                ],
                overlays: [
                    { name: 'b-chart-overlay__grid' },
                    {
                        name: 'b-chart-overlay__render',
                        renderName: 'b-chart-render__fill'
                    },
                    {
                        name: 'b-chart-overlay__render',
                        renderName: 'b-chart-render__line',
                        colorMixin: '#000'
                    },
                    { name: 'b-chart-overlay__tooltip' }
                ]
            }
        }
    ]
})

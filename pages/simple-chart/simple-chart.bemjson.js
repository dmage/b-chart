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
                            updateInterval: 5000
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
                        range: {
                            from: 0.0,
                            to: 10.0
                        }
                    },
                    { pos: 'right' },
                    { pos: 'left' }
                ],
                items: [
                    {
                        name: 'sin(x)',
                        xAxis: 0,
                        yAxis: 0,
                        color: '#393',
                        dataProvider: {
                            name: 'i-math-data-provider',
                            func: 'sin',
                            step: 0.05
                        }
                    },
                    {
                        name: 'cos(x)',
                        xAxis: 0,
                        yAxis: 0,
                        color: '#339',
                        dataProvider: {
                            name: 'i-math-data-provider',
                            func: 'cos',
                            step: 0.05
                        }
                    },
                    {
                        name: 'sin(x), axis #2',
                        xAxis: 1,
                        yAxis: 0,
                        color: '#cc3',
                        dataProvider: {
                            name: 'i-math-data-provider',
                            func: 'sin',
                            step: 0.05
                        }
                    }
                ]
            }
        }
    ]
})

({
    shouldDeps: [
        { elem: 'title' },
        { elem: 'axis' },
        { block: 'b-axis' },
        { block: 'b-busy' },
        { block: 'b-chart-overlay', elem: 'grid' },
        { block: 'b-chart-overlay', elem: 'render' },
        { elem: 'static-settings-provider' },
        { elem: 'static-range-provider' },
        { block: 'b-scale', elem: 'linear' },
        { block: 'i-math-data-provider' },
        { block: 'i-time-range-provider' },
        { block: 'b-chart-filter', elem: 'threshold' },
        { block: 'b-chart-processor', elem: 'stacked' },
        { block: 'b-chart-render', elem: 'line' },
        { block: 'b-chart-render', elem: 'fill' }
    ],
    mustDeps: [
        {
            block: 'i-bem',
            elem: 'dom'
        },
        { block: 'i-task-scheduler' }
    ]
})

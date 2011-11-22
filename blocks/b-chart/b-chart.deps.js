({
    shouldDeps: [
        { elem: 'title' },
        { elem: 'axis' },
        { block: 'b-axis' },
        { block: 'b-busy' },
        { block: 'b-chart-overlay', elem: 'grid' },
        { elem: 'static-settings-provider' },
        { block: 'b-scale', elem: 'linear' },
    ],
    mustDeps: [
        {
            block: 'i-bem',
            elem: 'dom'
        }
    ]
})

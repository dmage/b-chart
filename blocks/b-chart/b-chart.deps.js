({
    shouldDeps: [
        { elem: 'static-settings-provider' },
        { elem: 'axis' },
        { block: 'b-busy' },
        { block: 'b-scale', elem: 'linear' },
        { block: 'b-chart-overlay', elem: 'grid' },
        { block: 'b-axis' },
    ],
    mustDeps: [
        {
            block: 'i-bem',
            elem: 'dom'
        }
    ]
})

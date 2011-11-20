({
    shouldDeps: [
        { elem: 'static-settings-provider' },
        { block: 'b-busy' },
        { block: 'b-scale', elem: 'linear' },
        { block: 'b-chart-overlay', elem: 'grid' },
    ],
    mustDeps: [
        {
            block: 'i-bem',
            elem: 'dom'
        }
    ]
})

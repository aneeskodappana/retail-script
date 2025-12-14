export const projectConfig = {
    'grove': {
        CdnBaseUrl: '/container_projects/project_1-0-0_uae_abudhabi_grove/',
        NavigationBaseUrl: '/uae/abudhabi/grove/',
        mallInteriorTitle: "Grove Retail Mall",
        floorPlan: {
            Code: 'grove_grove_retail_mall',
            Title: 'Grove Retail Mall',
            Subtitle: 'Grove',
            navigationUrlSlug: '_retail_mall'
        },
        interior: {
            Code: 'grove_grove_retail_mall',
            Title: 'Grove Retail Mall',
        },
        hero: {
            Code: 'grove_hero',
            Title: 'Grove Mall',
            Subtitle: 'Grove',
        }
    },
    'yas': {
        CdnBaseUrl: '/container_projects/project_1-0-0_uae_abudhabi_yasmall/',
        NavigationBaseUrl: '/uae/abudhabi/yas/',
        mallInteriorTitle: "Yas Mall",
        floorPlan: {
            Code: 'yas_yas_mall',
            Title: 'Yas Mall',
            Subtitle: 'Yas',
            navigationUrlSlug: '_mall'
        },
        interior: {
            Code: 'yas_yas_mall',
            Title: 'Yas Mall',
        },
        hero: {
            Code: 'yas_hero',
            Title: 'Yas Mall',
            Subtitle: 'Yas',
        }
    },
} as const;
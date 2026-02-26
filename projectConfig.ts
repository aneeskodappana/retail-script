export const projectConfig = {
    'grove': {
        CdnBaseUrl: '/container_projects/project_1-0-0_uae_abudhabi_grove/',
        NavigationBaseUrl: '/uae/abudhabi/grove/',
        mallInteriorTitle: "Grove Retail Mall",
        floorPlan: {
            Code: 'grove_grove_retail_mall',
            Title: 'Grove Retail Mall',
            Subtitle: 'Grove',
            navigationUrlSlug: '_retail_mall',
            BackplateHeight: 4096, 
            BackplateWidth: 4006,
            markerNavigateToBase: '/uae/abudhabi/grove/mall/', // @TODO: Confirm this
            staticMarkers: [] as Array<{ title: string; x: number; y: number }>
        },
        interior: {
            Code: 'grove_grove_retail_mall',
            Title: 'Grove Retail Mall',
            NavigationBaseUrl: '/uae/abudhabi/grove/mall/grove_retail_mall/',
        },
        hero: {
            Code: 'grove_hero',
            Title: 'Grove Mall',
            Subtitle: 'Grove',
            marker: {
                position: {
                    top: 500, // based on backplate size
                    left: 500
                }
            }
        }
    },
    'yas': {
        CdnBaseUrl: '/container_projects/project_1-0-0_uae_abudhabi_yasmall/',
        NavigationBaseUrl: '/uae/abudhabi/yas/mall/yas_mall_ground',
        mallInteriorTitle: "Yas Mall",
        floorPlan: {
            Code: 'yas_yas_mall',
            Title: 'Ground Floor',
            Subtitle: 'Yas Mall',
            navigationUrlSlug: '_mall',
            BackplateHeight: 4096, 
            BackplateWidth: 4006,
            markerNavigateToBase: '/uae/abudhabi/yas/mall/yas_mall/',
            staticMarkers: [
                { title: 'Cinema Car Park', x: 1071, y: 798 },
                { title: 'VIP Entrance', x: 2026, y: 431 },
                { title: 'Hypermarket Car Park', x: 2891, y: 724 },
                { title: 'Grand Prix Car Park', x: 2939, y: 2772 },
            ]
        },
        interior: {
            Code: 'yas_yas_mall',
            Title: 'Yas Mall',
            NavigationBaseUrl: '/uae/abudhabi/grove/mall/grove_retail_mall/',
        },
        hero: {
            Code: 'yas_hero',
            Title: 'Yas Mall',
            Subtitle: 'Yas',
            marker: {
                position: {
                    top: 1500, // based on backplate size
                    left: 1000
                }
            },
            videoTransition: {
                fromLayout2dId: {
                    dev: '0fd9389e-e5ec-4ceb-9876-909ee7835179',
                    prod: ''
                },
                mediaUrl: 'transition_video/transition_video_yasisland_yasmallhero_day.mp4'
            }
        }
    },
} as const;
import { LandListing } from '../types';

export const INITIAL_LISTINGS: LandListing[] = [
  {
    id: 'plot_gl_0001',
    referenceNumber: 'GL-0001',
    title: 'Surveyed 50 Decimals Residential Estate Plot with Ready Title in Kira',
    description: 'Prime surveyed residential plot situated within an established residential neighborhood in Kira Municipality. Features well-demarcated boundary cornerstones, a gentle slope suitable for immediate villa or home construction, and an open panoramic valley view. The land has a clear Private Mailo title deed available for inspection at the Ministry of Lands Zonal Office.',
    priceUgx: 45000000,
    landSize: 50,
    measurementUnit: 'decimals',
    category: 'Residential Plot',
    districtId: 'dist_wakiso',
    districtName: 'Wakiso',
    administrativeUnitId: 'unit_wak_kira',
    administrativeUnitName: 'Kira Municipality',
    parishOrWard: 'Kimwanyi',
    villageOrLocality: 'Nsawo Estate',
    additionalLocationInfo: '1.8 km off Kira-Kasangati Road, turning right at the Shell Petrol station.',
    gpsCoordinates: {
      latitude: 0.3986,
      longitude: 32.6412,
    },
    tenureType: 'Mailo Land (Private Mailo)',
    roadAccess: '30-foot well-graded murram road with concrete drainage culverts.',
    electricityAvailable: true,
    waterAvailable: true,
    waterSource: 'NWSC piped national water network on property line',
    topography: 'Gentle, well-drained slope with red loam soil.',
    media: [
      {
        id: 'med_0001_1',
        listingId: 'plot_gl_0001',
        mediaType: 'photo',
        url: '/images/uganda_plot_residential_1792429858634.jpg',
        displayOrder: 1,
        caption: 'Primary front view showing corner survey boundary beacon and cleared grounds'
      },
      {
        id: 'med_0001_2',
        listingId: 'plot_gl_0001',
        mediaType: 'photo',
        url: '/images/uganda_plot_access_road_1792429877467.jpg',
        displayOrder: 2,
        caption: 'Graded access road leading directly to the property'
      },
      {
        id: 'med_0001_3',
        listingId: 'plot_gl_0001',
        mediaType: 'photo',
        url: '/images/uganda_plot_detail_boundary_1792429877540.jpg',
        displayOrder: 3,
        caption: 'Concrete cadastral survey beacon marking official boundary perimeter'
      },
      {
        id: 'med_0001_4',
        listingId: 'plot_gl_0001',
        mediaType: 'video',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        displayOrder: 4,
        caption: 'Ground-level walkthrough video displaying terrain and access'
      }
    ],
    availability: 'available',
    publicationStatus: 'published',
    isFeatured: true,
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-03-01T14:30:00Z'
  },
  {
    id: 'plot_gl_0002',
    referenceNumber: 'GL-0002',
    title: 'Commercial Highway Plot with Direct Tarmac Frontage in Goma, Mukono',
    description: 'High-visibility commercial plot along the vital Kampala-Jinja economic corridor in Goma Division, Mukono. Perfect for a commercial warehouse, service station, hardware store, medical clinic, or mixed commercial-residential plaza. Direct asphalt highway access with installed three-phase industrial electrical power lines.',
    priceUgx: 120000000,
    landSize: 25,
    measurementUnit: 'decimals',
    category: 'Commercial Land',
    districtId: 'dist_mukono',
    districtName: 'Mukono',
    administrativeUnitId: 'unit_muk_goma',
    administrativeUnitName: 'Goma Division',
    parishOrWard: 'Seeta',
    villageOrLocality: 'Bajjo Trading Hub',
    additionalLocationInfo: 'Directly fronting Kampala-Jinja Road at Km 18, near Seeta High School turn-off.',
    gpsCoordinates: {
      latitude: 0.3541,
      longitude: 32.7011,
    },
    tenureType: 'Freehold',
    roadAccess: 'Immediate tarmac highway frontage with dual-lane deceleration strip.',
    electricityAvailable: true,
    waterAvailable: true,
    waterSource: 'NWSC piped main line',
    topography: 'Flat, level grade ready for commercial construction without deep excavations.',
    media: [
      {
        id: 'med_0002_1',
        listingId: 'plot_gl_0002',
        mediaType: 'photo',
        url: '/images/uganda_plot_commercial_1792429859979.jpg',
        displayOrder: 1,
        caption: 'Direct tarmac corridor road-front view and utility poles'
      },
      {
        id: 'med_0002_2',
        listingId: 'plot_gl_0002',
        mediaType: 'photo',
        url: '/images/uganda_plot_detail_boundary_1792429877540.jpg',
        displayOrder: 2,
        caption: 'Concrete cadastral survey peg showing surveyed boundary'
      },
      {
        id: 'med_0002_3',
        listingId: 'plot_gl_0002',
        mediaType: 'photo',
        url: '/images/uganda_plot_access_road_1792429877467.jpg',
        displayOrder: 3,
        caption: 'Secondary side service road allowing truck entry and offloading'
      },
      {
        id: 'med_0002_4',
        listingId: 'plot_gl_0002',
        mediaType: 'video',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        displayOrder: 4,
        caption: 'Road-front corridor video tour showing traffic flow and site visibility'
      }
    ],
    availability: 'available',
    publicationStatus: 'published',
    isFeatured: true,
    createdAt: '2026-02-12T11:00:00Z',
    updatedAt: '2026-03-02T10:15:00Z'
  },
  {
    id: 'plot_gl_0003',
    referenceNumber: 'GL-0003',
    title: 'Elevated 1 Acre Lake Victoria View Estate Land in Katabi, Entebbe Corridor',
    description: 'Spectacular 1-acre (100 decimals) elevated property in Katabi Town Council with breathtaking panoramic vistas over Lake Victoria. Located in an upscale, tranquil environment ideal for a luxury family residence, eco-lodge, retirement sanctuary, or boutique hospitality retreat.',
    priceUgx: 85000000,
    landSize: 1,
    measurementUnit: 'acres',
    category: 'Residential Plot',
    districtId: 'dist_wakiso',
    districtName: 'Wakiso',
    administrativeUnitId: 'unit_wak_katabi',
    administrativeUnitName: 'Katabi Town Council',
    parishOrWard: 'Kasenyi',
    villageOrLocality: 'Nkumba Viewpoint',
    additionalLocationInfo: '4 km off the Entebbe-Kampala Expressway Nkumba interchange.',
    gpsCoordinates: {
      latitude: 0.1023,
      longitude: 32.4867,
    },
    tenureType: 'Mailo Land (Private Mailo)',
    roadAccess: 'Tarred and compacted murram spur road with low neighborhood vehicle traffic.',
    electricityAvailable: true,
    waterAvailable: true,
    waterSource: 'NWSC water mains plus rainwater retention catchment suitability',
    topography: 'Tiered gentle ridge offering uninterrupted 180-degree lake horizon.',
    media: [
      {
        id: 'med_0003_1',
        listingId: 'plot_gl_0003',
        mediaType: 'photo',
        url: '/images/uganda_plot_lake_entebbe_1792429875535.jpg',
        displayOrder: 1,
        caption: 'Elevated view across green acreage looking directly onto Lake Victoria'
      },
      {
        id: 'med_0003_2',
        listingId: 'plot_gl_0003',
        mediaType: 'photo',
        url: '/images/uganda_plot_residential_1792429858634.jpg',
        displayOrder: 2,
        caption: 'Cleared lawn terrain with perimeter boundary markers'
      },
      {
        id: 'med_0003_3',
        listingId: 'plot_gl_0003',
        mediaType: 'photo',
        url: '/images/uganda_plot_detail_boundary_1792429877540.jpg',
        displayOrder: 3,
        caption: 'Detailed survey corner beacon showing verified coordinates'
      },
      {
        id: 'med_0003_4',
        listingId: 'plot_gl_0003',
        mediaType: 'video',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        displayOrder: 4,
        caption: 'Panoramic horizon video tour capturing Lake Victoria breeze and views'
      }
    ],
    availability: 'available',
    publicationStatus: 'published',
    isFeatured: true,
    createdAt: '2026-02-15T15:20:00Z',
    updatedAt: '2026-03-05T08:00:00Z'
  },
  {
    id: 'plot_gl_0004',
    referenceNumber: 'GL-0004',
    title: '5 Acres Fertile Loam Farmland in Nyimbwa, Luweero District',
    description: 'Expansive 5-acre agricultural parcel with deep, fertile black loam soil in Nyimbwa Subcounty, Luweero. Highly productive land suitable for horticulture, matooke banana farming, avocado orchards, livestock, poultry farming, or farm estate development. Year-round natural spring water source at the bottom boundary.',
    priceUgx: 35000000,
    landSize: 5,
    measurementUnit: 'acres',
    category: 'Agricultural Land',
    districtId: 'dist_luweero',
    districtName: 'Luweero',
    administrativeUnitId: 'unit_luw_nyimbwa',
    administrativeUnitName: 'Nyimbwa Subcounty',
    parishOrWard: 'Nandere',
    villageOrLocality: 'Kasozi Farm Valley',
    additionalLocationInfo: '3.5 km off Kampala-Gulu Highway, branching off at Nyimbwa Trading Center.',
    gpsCoordinates: {
      latitude: 0.7121,
      longitude: 32.5401,
    },
    tenureType: 'Customary',
    roadAccess: 'Wide agricultural truck track connecting directly to main district murram feeder road.',
    electricityAvailable: true,
    waterAvailable: true,
    waterSource: 'Perennial natural freshwater valley stream and tested shallow borehole site',
    topography: 'Rolling gentle contours with rich agricultural soil beds.',
    media: [
      {
        id: 'med_0004_1',
        listingId: 'plot_gl_0004',
        mediaType: 'photo',
        url: '/images/uganda_plot_farmland_1792429859443.jpg',
        displayOrder: 1,
        caption: 'Fertile tilled black soil and banana vegetation across the acreage'
      },
      {
        id: 'med_0004_2',
        listingId: 'plot_gl_0004',
        mediaType: 'photo',
        url: '/images/hero_uganda_landscape_1792429858568.jpg',
        displayOrder: 2,
        caption: 'Panoramic valley view showcasing neighboring agricultural farms'
      },
      {
        id: 'med_0004_3',
        listingId: 'plot_gl_0004',
        mediaType: 'photo',
        url: '/images/uganda_plot_detail_boundary_1792429877540.jpg',
        displayOrder: 3,
        caption: 'Survey beacon installed at farm perimeter boundary'
      },
      {
        id: 'med_0004_4',
        listingId: 'plot_gl_0004',
        mediaType: 'video',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        displayOrder: 4,
        caption: 'Field video recording traversing the 5-acre agricultural contours'
      }
    ],
    availability: 'available',
    publicationStatus: 'published',
    isFeatured: false,
    createdAt: '2026-02-18T10:00:00Z',
    updatedAt: '2026-02-28T16:45:00Z'
  },
  {
    id: 'plot_gl_0005',
    referenceNumber: 'GL-0005',
    title: '50 Decimals Hilltop Residential Plot with Fresh Air in Kasangati',
    description: 'Exceptional 50-decimals residential plot nestled on the serene Nangabo ridge in Kasangati Town Council. Offers quiet countryside living just 25 minutes from Kampala. Neighboring high-end modern private residences with electricity and running water in place.',
    priceUgx: 38000000,
    landSize: 50,
    measurementUnit: 'decimals',
    category: 'Residential Plot',
    districtId: 'dist_wakiso',
    districtName: 'Wakiso',
    administrativeUnitId: 'unit_wak_kasangati',
    administrativeUnitName: 'Kasangati Town Council',
    parishOrWard: 'Nangabo',
    villageOrLocality: 'Gayaza Ridge',
    additionalLocationInfo: '2 km from Kasangati Resort Center, along Gayaza branch route.',
    gpsCoordinates: {
      latitude: 0.4412,
      longitude: 32.6105,
    },
    tenureType: 'Mailo Land (Private Mailo)',
    roadAccess: '25-foot graded private access easement leading to the plot gate.',
    electricityAvailable: true,
    waterAvailable: true,
    waterSource: 'National Water and Sewerage Corporation (NWSC) pipe connection ready',
    topography: 'Gentle elevated knoll with natural drainage.',
    media: [
      {
        id: 'med_0005_1',
        listingId: 'plot_gl_0005',
        mediaType: 'photo',
        url: '/images/hero_uganda_landscape_1792429858568.jpg',
        displayOrder: 1,
        caption: 'Hilltop landscape view looking across the Kasangati valley'
      },
      {
        id: 'med_0005_2',
        listingId: 'plot_gl_0005',
        mediaType: 'photo',
        url: '/images/uganda_plot_access_road_1792429877467.jpg',
        displayOrder: 2,
        caption: 'Red murram access road with clear drainage and electricity poles'
      },
      {
        id: 'med_0005_3',
        listingId: 'plot_gl_0005',
        mediaType: 'photo',
        url: '/images/uganda_plot_residential_1792429858634.jpg',
        displayOrder: 3,
        caption: 'Cleared building footprint ready for foundation layout'
      },
      {
        id: 'med_0005_4',
        listingId: 'plot_gl_0005',
        mediaType: 'video',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        displayOrder: 4,
        caption: 'Driveway and neighborhood video showing surrounding developments'
      }
    ],
    availability: 'available',
    publicationStatus: 'published',
    isFeatured: true,
    createdAt: '2026-02-22T13:30:00Z',
    updatedAt: '2026-03-04T11:20:00Z'
  },
  {
    id: 'plot_gl_0006',
    referenceNumber: 'GL-0006',
    title: '75 Decimals Mixed-Use Commercial / Residential Plot in Masaka City',
    description: 'Prominent 75-decimals plot in the fast-growing Kimanya-Kabonera Division of Masaka City. Excellent road connectivity making it ideal for institutional use, apartments, a logistics hub, or modern gated townhouses. Clean Freehold land title with no encumbrances.',
    priceUgx: 60000000,
    landSize: 75,
    measurementUnit: 'decimals',
    category: 'Mixed-Use Land',
    districtId: 'dist_masaka',
    districtName: 'Masaka',
    administrativeUnitId: 'unit_msk_kimanya',
    administrativeUnitName: 'Kimanya-Kabonera Division',
    parishOrWard: 'Mukungwe',
    villageOrLocality: 'Kirumba Heights',
    additionalLocationInfo: '1.2 km from Masaka City Hall roundabout towards Nyendo.',
    gpsCoordinates: {
      latitude: -0.3411,
      longitude: 31.7362,
    },
    tenureType: 'Freehold',
    roadAccess: 'Tarmac feeder road on the front with 20ft side easement road.',
    electricityAvailable: true,
    waterAvailable: true,
    waterSource: 'NWSC piped connection in place',
    topography: 'Flat to gentle grade with firm red clay foundation substrate.',
    media: [
      {
        id: 'med_0006_1',
        listingId: 'plot_gl_0006',
        mediaType: 'photo',
        url: '/images/uganda_plot_residential_1792429858634.jpg',
        displayOrder: 1,
        caption: 'Broad front view across the 75 decimals plot footprint'
      },
      {
        id: 'med_0006_2',
        listingId: 'plot_gl_0006',
        mediaType: 'photo',
        url: '/images/uganda_plot_commercial_1792429859979.jpg',
        displayOrder: 2,
        caption: 'Commercial road frontage and nearby city infrastructure'
      },
      {
        id: 'med_0006_3',
        listingId: 'plot_gl_0006',
        mediaType: 'photo',
        url: '/images/uganda_plot_detail_boundary_1792429877540.jpg',
        displayOrder: 3,
        caption: 'Corner demarcation beacon with survey numbers stamped'
      },
      {
        id: 'med_0006_4',
        listingId: 'plot_gl_0006',
        mediaType: 'video',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        displayOrder: 4,
        caption: 'Video inspection of frontage and adjacent developments'
      }
    ],
    availability: 'reserved',
    publicationStatus: 'published',
    isFeatured: false,
    createdAt: '2026-02-25T08:15:00Z',
    updatedAt: '2026-03-06T15:10:00Z'
  }
];

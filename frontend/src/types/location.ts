export type ButwalLocation =
  | 'Traffic Chowk, Butwal'
  | 'Golpark, Butwal'
  | 'Devinagar, Butwal'
  | 'Kalikanagar, Butwal'
  | 'Milanchowk, Butwal'
  | 'Chauraha, Butwal'
  | 'Deepnagar, Butwal'
  | 'Tamnagar, Butwal'
  | 'Nayagaon, Butwal'
  | 'Manigram, Butwal'
  | 'Drivertole, Butwal'
  | 'Yogikuti, Butwal'
  | 'Belbas, Butwal'
  | 'Sukhanagar, Butwal'
  | 'Amarpath, Butwal'
  | 'Haatbazaar, Butwal'
  | 'Motipur, Butwal'
  | 'Semlar, Butwal'
  | 'Other, Butwal'

export interface LocationItem {
  id: string
  name: ButwalLocation | string
  area: string
  city: string
  province: string
}

export const BUTWAL_LOCATIONS: readonly ButwalLocation[] = [
  'Traffic Chowk, Butwal',
  'Golpark, Butwal',
  'Devinagar, Butwal',
  'Kalikanagar, Butwal',
  'Milanchowk, Butwal',
  'Chauraha, Butwal',
  'Deepnagar, Butwal',
  'Tamnagar, Butwal',
  'Nayagaon, Butwal',
  'Manigram, Butwal',
  'Drivertole, Butwal',
  'Yogikuti, Butwal',
  'Belbas, Butwal',
  'Sukhanagar, Butwal',
  'Amarpath, Butwal',
  'Haatbazaar, Butwal',
  'Motipur, Butwal',
  'Semlar, Butwal',
  'Other, Butwal',
] as const

export const SUPPORTED_LOCATIONS: readonly LocationItem[] = [
  {
    id: 'traffic-chowk',
    name: 'Traffic Chowk, Butwal',
    area: 'Traffic Chowk',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'golpark',
    name: 'Golpark, Butwal',
    area: 'Golpark',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'devinagar',
    name: 'Devinagar, Butwal',
    area: 'Devinagar',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'kalikanagar',
    name: 'Kalikanagar, Butwal',
    area: 'Kalikanagar',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'milanchowk',
    name: 'Milanchowk, Butwal',
    area: 'Milanchowk',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'chauraha',
    name: 'Chauraha, Butwal',
    area: 'Chauraha',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'deepnagar',
    name: 'Deepnagar, Butwal',
    area: 'Deepnagar',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'tamnagar',
    name: 'Tamnagar, Butwal',
    area: 'Tamnagar',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'nayagaon',
    name: 'Nayagaon, Butwal',
    area: 'Nayagaon',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'manigram',
    name: 'Manigram, Butwal',
    area: 'Manigram',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'drivertole',
    name: 'Drivertole, Butwal',
    area: 'Drivertole',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'yogikuti',
    name: 'Yogikuti, Butwal',
    area: 'Yogikuti',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'belbas',
    name: 'Belbas, Butwal',
    area: 'Belbas',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'sukhanagar',
    name: 'Sukhanagar, Butwal',
    area: 'Sukhanagar',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'amarpath',
    name: 'Amarpath, Butwal',
    area: 'Amarpath',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'haatbazaar',
    name: 'Haatbazaar, Butwal',
    area: 'Haatbazaar',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'motipur',
    name: 'Motipur, Butwal',
    area: 'Motipur',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'semlar',
    name: 'Semlar, Butwal',
    area: 'Semlar',
    city: 'Butwal',
    province: 'Lumbini',
  },
  {
    id: 'other-butwal',
    name: 'Other, Butwal',
    area: 'Other',
    city: 'Butwal',
    province: 'Lumbini',
  },
] as const

export type AppLocation = ButwalLocation | string

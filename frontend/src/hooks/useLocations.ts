import { useQuery } from '@tanstack/react-query'
import { getLocationsApi } from '#/lib/api'
import type { LocationItem } from '#/types/location'
import { SUPPORTED_LOCATIONS } from '#/types/location'

export const LOCATIONS_QUERY_KEY = ['locations']

export function useLocations() {
  return useQuery<LocationItem[]>({
    queryKey: LOCATIONS_QUERY_KEY,
    queryFn: getLocationsApi,
    staleTime: 1000 * 60 * 60, // 1 hour
    initialData: () => [...SUPPORTED_LOCATIONS],
  })
}

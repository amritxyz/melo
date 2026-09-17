import { useQuery } from '@tanstack/react-query'
import { getLocationsApi, getMeetupSuggestionApi } from '#/lib/api'
import type { LocationItem, MeetupSuggestion } from '#/types/location'
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

export function useMeetupSuggestion(buyerLoc?: string, sellerLoc?: string) {
  return useQuery<MeetupSuggestion>({
    queryKey: ['locations', 'meetup', buyerLoc, sellerLoc],
    queryFn: () => getMeetupSuggestionApi(buyerLoc!, sellerLoc!),
    enabled: !!buyerLoc && !!sellerLoc,
    staleTime: 1000 * 60 * 10,
  })
}


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createListingApi,
  deleteListingApi,
  getCategoriesApi,
  getListingByIDApi,
  getListingsApi,
  markListingSoldApi,
  updateListingApi,
} from '#/lib/api'
import type {
  CreateListingPayload,
  ListingFilterParams,
  UpdateListingPayload,
} from '#/types/listing'

export const CATEGORIES_QUERY_KEY = ['categories']
export const LISTINGS_QUERY_KEY = ['listings']
export const listingDetailQueryKey = (id: string) => ['listing', id]

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: getCategoriesApi,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useListings(params: ListingFilterParams = {}) {
  return useQuery({
    queryKey: [...LISTINGS_QUERY_KEY, params],
    queryFn: () => getListingsApi(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useListing(id: string) {
  return useQuery({
    queryKey: listingDetailQueryKey(id),
    queryFn: () => getListingByIDApi(id),
    enabled: !!id,
  })
}

export function useCreateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateListingPayload) => createListingApi(payload),
    onSuccess: (newListing) => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_QUERY_KEY })
      queryClient.setQueryData(listingDetailQueryKey(newListing.id), newListing)
    },
  })
}

export function useUpdateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateListingPayload
    }) => updateListingApi(id, payload),
    onSuccess: (updatedListing) => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_QUERY_KEY })
      queryClient.setQueryData(
        listingDetailQueryKey(updatedListing.id),
        updatedListing,
      )
    },
  })
}

export function useDeleteListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteListingApi(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_QUERY_KEY })
      queryClient.removeQueries({ queryKey: listingDetailQueryKey(id) })
    },
  })
}

export function useMarkListingSold() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markListingSoldApi(id),
    onSuccess: (updatedListing) => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_QUERY_KEY })
      queryClient.setQueryData(
        listingDetailQueryKey(updatedListing.id),
        updatedListing,
      )
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addFavoriteApi,
  getFavoriteIdsApi,
  getFavoritesApi,
  removeFavoriteApi,
} from '#/lib/api'
import { useAuth } from './useAuth'

export function useFavoriteIds() {
  const { user } = useAuth()

  const { data: favoriteIds = [], isLoading } = useQuery({
    queryKey: ['favorite-ids'],
    queryFn: getFavoriteIdsApi,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const isFavorited = (listingId: string) => favoriteIds.includes(listingId)

  return {
    favoriteIds,
    isFavorited,
    isLoading,
  }
}

export function useFavorites(page = 1, limit = 20) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['favorites', page, limit],
    queryFn: () => getFavoritesApi(page, limit),
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  const { isFavorited } = useFavoriteIds()

  return useMutation({
    mutationFn: async (listingId: string) => {
      const currentlyFavorited = isFavorited(listingId)
      if (currentlyFavorited) {
        return removeFavoriteApi(listingId)
      } else {
        return addFavoriteApi(listingId)
      }
    },
    onMutate: async (listingId: string) => {
      // Cancel ongoing queries for IDs
      await queryClient.cancelQueries({ queryKey: ['favorite-ids'] })

      const previousIds =
        queryClient.getQueryData<string[]>(['favorite-ids']) || []
      const currentlyFavorited = previousIds.includes(listingId)

      const updatedIds = currentlyFavorited
        ? previousIds.filter((id) => id !== listingId)
        : [...previousIds, listingId]

      queryClient.setQueryData(['favorite-ids'], updatedIds)

      return { previousIds }
    },
    onError: (_err, _listingId, context) => {
      if (context?.previousIds) {
        queryClient.setQueryData(['favorite-ids'], context.previousIds)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-ids'] })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getUserProfileApi,
  getUserReviewsApi,
  submitReviewApi,
  updateProfileApi,
} from '#/lib/api'
import type { SubmitReviewPayload, UpdateProfilePayload } from '#/types/auth'
import { useAuth } from './useAuth'

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () =>
      userId ? getUserProfileApi(userId) : Promise.reject('No userId provided'),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useUserReviews(
  userId: string | undefined,
  page = 1,
  limit = 10,
) {
  return useQuery({
    queryKey: ['user-reviews', userId, page, limit],
    queryFn: () =>
      userId
        ? getUserReviewsApi(userId, page, limit)
        : Promise.reject('No userId provided'),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfileApi(payload),
    onSuccess: (updatedProfile) => {
      // Invalidate current user profile cache
      queryClient.invalidateQueries({
        queryKey: ['user-profile', updatedProfile.id],
      })
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user-profile', user.id] })
      }
      queryClient.invalidateQueries({ queryKey: ['user-profile', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}

export function useSubmitReview(sellerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) =>
      submitReviewApi(sellerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', sellerId] })
      queryClient.invalidateQueries({ queryKey: ['user-reviews', sellerId] })
    },
  })
}

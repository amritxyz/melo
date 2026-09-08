import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMeApi, loginApi, logoutApi, signupApi } from '#/lib/api'
import { hasTokens } from '#/lib/auth'

export const AUTH_QUERY_KEY = ['auth', 'me']

export function useAuth() {
  const queryClient = useQueryClient()

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      if (!hasTokens()) return null
      try {
        return await getMeApi()
      } catch {
        return null
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  const user = data?.user ?? null
  const isAuthenticated = !!user

  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string
      password: string
    }) => {
      const res = await loginApi(email, password)
      return res
    },
    onSuccess: (authData) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, { user: authData.user })
    },
  })

  const signupMutation = useMutation({
    mutationFn: async ({
      username,
      email,
      password,
    }: {
      username: string
      email: string
      password: string
    }) => {
      const res = await signupApi(username, email, password)
      return res
    },
    onSuccess: (authData) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, { user: authData.user })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logoutApi()
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null)
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
    },
  })

  return {
    user,
    isLoading: isLoading || isFetching,
    isAuthenticated,
    error,
    refetchUser: refetch,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    signup: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,
    signupError: signupMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  }
}

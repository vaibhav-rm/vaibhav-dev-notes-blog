import { useQuery } from 'react-query'
import appwriteService from '../appwrite/conf'
import { uniquePosts, sortByDateDesc } from './taxonomy'

const CACHE_KEY = 'allPublicPosts'
const CACHE_TIME = 1000 * 60 * 5

/**
 * Every public page needs the full post list to build tag and category indexes,
 * so it is fetched once and shared through the react-query cache.
 */
export function useAllPosts() {
  const { data, isLoading, error } = useQuery(
    [CACHE_KEY],
    async () => {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        try {
          return JSON.parse(cached)
        } catch {
          localStorage.removeItem(CACHE_KEY)
        }
      }

      const response = await appwriteService.getPosts([])
      const documents = response?.documents || []
      const sorted = sortByDateDesc(uniquePosts(documents))
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(sorted))
      } catch {
        // A full localStorage quota must not break rendering.
      }
      return sorted
    },
    {
      staleTime: CACHE_TIME,
      cacheTime: CACHE_TIME,
      refetchOnWindowFocus: false,
    }
  )

  return { posts: data || [], isLoading, error }
}
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { trackPageView } from "../lib/analytics"

/**
 * Single page apps fire no navigation events on their own, so GA4 would record
 * every article view as `/`. This sends one page_view per route change.
 */
export default function RouteChangeTracker() {
  const location = useLocation()

  useEffect(() => {
    // Let the page's own SEO component commit <title> before reporting it.
    const id = setTimeout(() => {
      trackPageView(`${location.pathname}${location.search}`, document.title)
    }, 0)
    return () => clearTimeout(id)
  }, [location.pathname, location.search])

  return null
}

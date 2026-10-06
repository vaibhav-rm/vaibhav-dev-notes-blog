const MEASUREMENT_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID || "").trim()

let loaderPromise = null

/**
 * GA4 for a single-page app.
 *
 * gtag.js is injected after first paint so the third-party request never sits on
 * the critical rendering path, and `send_page_view` is disabled so we can emit
 * exactly one page_view per route change instead of one for the whole session.
 */
function loadGtag() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"))
  if (MEASUREMENT_ID.startsWith("%")) return Promise.reject(new Error("ga disabled"))

  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      window.dataLayer = window.dataLayer || []
      window.gtag = function gtag() {
        window.dataLayer.push(arguments)
      }
      window.gtag("js", new Date())
      window.gtag("config", MEASUREMENT_ID, { send_page_view: false })

      const script = document.createElement("script")
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("gtag failed to load"))
      document.head.appendChild(script)
    })
  }

  return loaderPromise
}

export function trackPageView(path, title) {
  loadGtag()
    .then(() => {
      window.gtag("event", "page_view", {
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href,
      })
    })
    .catch(() => {})
}

export function trackEvent(name, params = {}) {
  loadGtag()
    .then(() => window.gtag("event", name, params))
    .catch(() => {})
}

export const analyticsEnabled = Boolean(MEASUREMENT_ID) && !MEASUREMENT_ID.startsWith("%")

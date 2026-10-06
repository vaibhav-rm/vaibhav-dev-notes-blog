import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../Logo'
import { SITE_URL } from '../../config/site'
import {
  Github,
  Twitter,
  Linkedin,
  Rss,
  ArrowUp,
  Copy,
  Check,
  ExternalLink,
  Code2,
} from 'lucide-react'

function Footer() {
  const year = new Date().getFullYear()
  const [copied, setCopied] = useState(false)

  const handleCopyRss = () => {
    const rssUrl = `${SITE_URL}/rss.xml`
    navigator.clipboard.writeText(rssUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800 transition-colors duration-200 mt-16">
      {/* Subtle top accent gradient */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <Logo />
            </Link>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 max-w-sm">
              Practical engineering notes on backend architecture, Linux, DevOps, and modern frontend development. Written with clarity and precision.
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com/vaibhav-rm"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-all duration-200"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="/rss.xml"
                aria-label="RSS Feed"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50 transition-all duration-200"
              >
                <Rss className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Column 1: Explore */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Latest Notes
                </Link>
              </li>
              <li>
                <Link
                  to="/all-posts"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  All Archive
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/tags"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Tags Index
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Resources & Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="/rss.xml"
                  className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  <span>RSS Feed</span>
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href={`${SITE_URL}/sitemap.xml`}
                  className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span>Sitemap</span>
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href={`${SITE_URL}/robots.txt`}
                  className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span>Robots.txt</span>
                </a>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Author Login
                </Link>
              </li>
            </ul>
          </div>

          {/* RSS Subscription & Utility Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Stay Updated
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Subscribe to the RSS feed for instant updates without email clutter.
            </p>
            <div className="flex flex-col space-y-2">
              <a
                href="/rss.xml"
                className="inline-flex items-center justify-center space-x-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors duration-200"
              >
                <Rss className="w-3.5 h-3.5" />
                <span>Subscribe via RSS</span>
              </a>
              <button
                type="button"
                onClick={handleCopyRss}
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">RSS Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy RSS Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200/80 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <span>&copy; {year} Vaibhav Dev Notes.</span>
            <span>•</span>
            <span className="flex items-center">
              Built with <Code2 className="w-3.5 h-3.5 mx-1 text-blue-500" /> & Appwrite
            </span>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer

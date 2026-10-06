import { Link } from 'react-router-dom'
import Logo from '../Logo'
import { SITE_URL } from '../../config/site'

function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="relative overflow-hidden py-10 bg-white dark:bg-gray-800 transition-colors duration-200 border-t border-gray-200 dark:border-gray-700 rounded shadow-[0_-3px_10px_rgb(0,0,0,0.06)]">
            <div className="relative z-10 mx-auto max-w-7xl px-4">
                <div className="-m-6 flex flex-wrap">
                    <div className="w-full p-6 md:w-1/2 lg:w-5/12">
                        <div className="flex h-full flex-col justify-between">
                            <div className="mb-4 inline-flex items-center">
                                <Logo width="100px" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Practical engineering notes on backend architecture, Linux,
                                DevOps and React. New posts roughly once a week.
                            </p>
                            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                &copy; {year} Vaibhav Notes. All rights reserved.
                            </p>
                        </div>
                    </div>
                    <nav aria-label="Browse" className="w-full p-6 md:w-1/2 lg:w-2/12">
                        <div className="h-full">
                            <h2 className="tracking-px mb-6 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                Browse
                            </h2>
                            <ul>
                                {[
                                    { label: 'Latest posts', to: '/' },
                                    { label: 'All posts', to: '/all-posts' },
                                ].map((link) => (
                                    <li key={link.to} className="mb-4">
                                        <Link
                                            className="text-base font-medium text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
                                            to={link.to}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <a
                                        className="text-base font-medium text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
                                        href="/rss.xml"
                                    >
                                        RSS feed
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                    <div className="w-full p-6 md:w-1/2 lg:w-2/12">
                        <div className="h-full">
                            <h2 className="tracking-px mb-6 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                Elsewhere
                            </h2>
                            <ul>
                                <li className="mb-4">
                                    <a
                                        className="text-base font-medium text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
                                        href={`https://github.com/vaibhav-rm`}
                                        target="_blank"
                                        rel="noopener noreferrer me"
                                    >
                                        GitHub
                                    </a>
                                </li>
                                <li className="mb-4">
                                    <a
                                        className="text-base font-medium text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
                                        href={`${SITE_URL}/sitemap.xml`}
                                    >
                                        Sitemap
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        className="text-base font-medium text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
                                        to="/login"
                                    >
                                        Sign in
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="w-full p-6 md:w-1/2 lg:w-3/12">
                        <div className="h-full">
                            <h2 className="tracking-px mb-6 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                Subscribe
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Get new posts in your feed reader — no inbox required.
                            </p>
                            <a
                                href="/rss.xml"
                                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                            >
                                Subscribe via RSS
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer

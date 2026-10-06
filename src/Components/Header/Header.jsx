import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { LogOut, Menu, X } from 'lucide-react'
import {useDispatch} from 'react-redux'
import authService from '../../appwrite/auth'
import {logout} from '../../Store/authSlice'
import DarkModeToggle from '../DarkModeToggle'


function Header({ darkMode, toggleDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const authStatus = useSelector((state) => state.auth.status)
  const dispatch = useDispatch()

  const logoutHandler = () => {
      authService.logout().then(() => {
          dispatch(logout())
      }).catch((error) => ("Something went wrong::", error));
  } 

  const navItems = [
    {
      name: 'Home',
      slug: '/',
      active: true,
    },
    {
      name: 'All Posts',
      slug: '/all-posts',
      active: true,
    },
    {
      name: 'Login',
      slug: '/login',
      active: !authStatus,
    },
    {
      name: 'Signup',
      slug: '/signup',
      active: !authStatus,
    },
    {
      name: 'Add Post',
      slug: '/add-post',
      active: authStatus,
    },
  ]

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className=" sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-gray-900 dark:text-white">Vaibhav Dev Notes</span>
          </Link>

          <nav aria-label="Main" className="hidden md:flex items-center space-x-4">
            {navItems.map(
              (item) =>
                item.active && (
                  <Link
                    key={item.name}
                    to={item.slug}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                )
            )}
            <a
              href="/rss.xml"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              RSS
            </a>
            <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </nav>

          <button
            onClick={toggleMobileMenu}
            className="md:hidden flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {authStatus && (
            <button
              onClick={logoutHandler}
              className="hidden md:flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 space-y-2 border-t bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
          {navItems.map(
            (item) =>
              item.active && (
                <Link
                  key={item.name}
                  to={item.slug}
                  onClick={toggleMobileMenu}
                  className="block w-full text-left text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              )
          )}
          <a
            href="/rss.xml"
            onClick={toggleMobileMenu}
            className="block w-full text-left text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            RSS Feed
          </a>
          <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          {authStatus && (
            <button
              onClick={() => {
                logoutHandler();
                toggleMobileMenu();
              }}
              className="flex w-full items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      )}
    </header>
  )
}

export default Header
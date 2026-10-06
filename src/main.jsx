import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from 'react-query';
import './index.css'
import {Provider} from 'react-redux'
import store from './Store/store'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthLayout, Login, SignUp, SEO } from './Components/index.js'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

// Writer/admin screens are never the public entry point. Keeping them out of
// the initial bundle takes TinyMCE + auth churn off the critical path.
const AllPost = lazy(() => import('./pages/AllPost.jsx'))
const AddPost = lazy(() => import('./pages/AddPost.jsx'))
const EditPost = lazy(() => import('./pages/EditPost.jsx'))
const Post = lazy(() => import('./pages/Post'))

function RouteFallback() {
  // While a route chunk loads we cannot know the page's real title or canonical,
  // so mark it noindex rather than briefly claiming the homepage URL.
  return (
    <>
      <SEO title="Loading" path="/loading" noindex />
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading…</p>
      </div>
    </>
  )
}

const router = createBrowserRouter([  {
    path: '/',
    element: <App/>,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'login',
        element: (
          <AuthLayout authentication = {false}>
            <Login />
          </AuthLayout>
        )
      },
      {
        path: 'signup',
        element: (
          <AuthLayout authentication = {false}>
            <SignUp />
          </AuthLayout>
        )
      },
      {
        path: 'all-posts',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <AllPost />
          </Suspense>
        )
      },
      {
        path: 'add-post',
        element: (
          <AuthLayout authentication>
            <Suspense fallback={<RouteFallback />}>
              <AddPost />
            </Suspense>
          </AuthLayout>
        )
      },
      {
        path: 'edit-post/:slug',
        element: (
          <AuthLayout authentication>
            <Suspense fallback={<RouteFallback />}>
              <EditPost />
            </Suspense>
          </AuthLayout>
        )
      },
      {
        path: 'post/:slug',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <Post />
          </Suspense>
        )
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
])

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <Provider store = {store}>
    <RouterProvider router={router} />
    </Provider>
    </QueryClientProvider>
  </React.StrictMode>,
)

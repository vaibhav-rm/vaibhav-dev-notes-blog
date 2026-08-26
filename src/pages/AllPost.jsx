import React, {useState, useEffect} from 'react'
import { Helmet } from 'react-helmet'
import { Search } from 'lucide-react'
import appwriteService from '../appwrite/conf'
import { Container, PostCard, PostCardSkeleton } from '../Components'

function AllPost() {
    const [posts, setPost] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        appwriteService.getPosts([]).then((posts) => {
            if (posts) {
                setPost(posts.documents)
            }
            setIsLoading(false)
        }).catch((error) => {
            console.error("Error fetching posts:", error)
            setIsLoading(false)
        })
    }, [])

    const filteredPosts = posts.filter((post) => {
        const titleMatch = post.title?.toLowerCase().includes(searchQuery.toLowerCase())
        const contentMatch = post.content?.toLowerCase().includes(searchQuery.toLowerCase())
        return titleMatch || contentMatch
    })

    return (
        <>
            <Helmet>
                <title>All Posts | Vaibhav Notes</title>
                <meta name="description" content="Browse all development notes, tutorials, and programming articles by Vaibhav." />
                <link rel="canonical" href="https://vaibhavnotes.pages.dev/all-posts" />
                <meta property="og:title" content="All Posts | Vaibhav Notes" />
                <meta property="og:description" content="Browse all development notes, tutorials, and programming articles by Vaibhav." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://vaibhavnotes.pages.dev/all-posts" />
            </Helmet>
            <div className='py-8 min-h-screen'>
                <Container>
                    <div className="flex flex-col items-center mb-8 max-w-xl mx-auto px-4">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                            Search All Notes
                        </h1>
                        <div className="relative w-full">
                            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search by title, keywords or content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                            {Array.from({ length: 8 }).map((_, idx) => (
                                <PostCardSkeleton key={idx} />
                            ))}
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                            {filteredPosts.map((post) => (
                                <PostCard key={post.$id} {...post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <h3 className="text-xl text-gray-500 dark:text-gray-400">
                                No posts match your search query.
                            </h3>
                        </div>
                    )}
                </Container>
            </div>
        </>
    )
}

export default AllPost
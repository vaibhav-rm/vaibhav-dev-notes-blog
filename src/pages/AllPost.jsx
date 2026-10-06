import { useState, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import appwriteService from '../appwrite/conf'
import { Container, PostCard, PostCardSkeleton, SEO } from '../Components'
import { SITE_URL, postUrl } from '../config/site'

const PAGE_DESCRIPTION =
    'Every article published on Vaibhav Notes, in one searchable archive — backend architecture, Linux, DevOps and React.'

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

    const filteredPosts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return posts
        return posts.filter((post) =>
            post.title?.toLowerCase().includes(query) ||
            post.content?.toLowerCase().includes(query)
        )
    }, [posts, searchQuery])

    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'All Posts',
        url: `${SITE_URL}/all-posts`,
        numberOfItems: posts.length,
        itemListElement: posts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: postUrl(post.$id),
            name: post.title,
        })),
    }

    return (
        <>
            <SEO
                title="All Posts"
                description={PAGE_DESCRIPTION}
                path="/all-posts"
                type="website"
                schema={posts.length ? itemListSchema : undefined}
            />
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
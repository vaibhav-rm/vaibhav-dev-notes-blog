import React, { useEffect, useState } from 'react';
import appwriteService from '../appwrite/conf';
import { Container, PostCard } from '../Components';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appwriteService.getPosts([])
      .then((post) => {
        if (post && post.documents) {
          console.log('Fetched posts:', post.documents); // Debugging: Log fetched posts
          setPosts(post.documents);  // Ensure this array contains posts
        } else {
          console.log('No posts found or incorrect response structure:', post);
        }
      })
      .catch((error) => {
        console.error('Error fetching posts:', error);  // Debugging: Log any errors
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full py-8 mt-4 text-center">
        <Container>
          <div className="flex flex-wrap">
            <div className="p-2 w-full h-80 flex align-center justify-center">
              <h1 className="text-2xl font-bold hover:text-gray-500 mt-10">
                Loading posts...
              </h1>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="w-full py-8 mt-4 text-center">
        <Container>
          <div className="flex flex-wrap">
            <div className="p-2 w-full h-80 flex align-center justify-center">
              <h1 className="text-2xl font-bold hover:text-gray-500 mt-10">
                No posts available.
              </h1>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <Container>
        <div className="flex flex-wrap">
          {posts.map((post) => (
            <div key={post.$id} className="p-2 w-1/3">
              <PostCard {...post} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

export default Home;

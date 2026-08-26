import React, {useState, useEffect} from 'react'
import { Helmet } from 'react-helmet'
import appwriteService from '../appwrite/conf'
import { Container, PostCard} from '../Components'

function AllPost() {

    const[posts, setPost] =  useState([]);
    useEffect(()=>{
        appwriteService.getPosts([]).then((posts) => {
            if(posts){
                setPost(posts.documents)
            }
        })
    }, [])

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
      <div className='py-8'>
          <Container>
              <div className='flex flex-wrap'>
              {
                  posts.map((post)=> (
                      <div key={post.$id} className="p-2 w-1/4">
                          <PostCard {...post} />
                      </div>
                  ))
              }
              </div>
          </Container>
      </div>
    </>
  )
}

export default AllPost
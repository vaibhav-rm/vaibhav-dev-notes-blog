import { Container, PostForm, SEO } from '../Components'

function AddPost() {
  return (
    <>
      <SEO title="Write a new post" path="/add-post" noindex />
      <div className='py-8'>
        <Container>
          <PostForm />
        </Container>
      </div>
    </>
  )
}

export default AddPost
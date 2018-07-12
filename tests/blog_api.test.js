const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { format, initialBlogs, blogsInDb, usersInDb } = require('./test_helper')

describe.only('when there is initially some blogs added', async () => {
  beforeAll(async () => {
    await Blog.remove({})
    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are three blogs', async () => {
    const response = await api
      .get('/api/blogs')
    expect(response.body.length).toBe(6)
  })

  test('first blog likes', async () => {
    const response = await api
      .get('/api/blogs')
    expect(response.body[0].likes).toBe(7)
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'uusi blogi',
      author: 'B. Logaaja',
      url: 'kotisivu',
      likes: 75
    }
    const blogsBefore = await blogsInDb()
    await api
      .post('/api/blogs')
      .send(format(newBlog))
      .expect(200)
      .expect('Content-Type', /application\/json/)
    await api
      .get('/api/blogs')
    const blogsAfter = await blogsInDb()
    expect(blogsAfter.length).toBe(blogsBefore.length + 1)
  })

  test('if blog post without likes is added', async () => {
    const newBlog = {
      title: 'uusi blogi',
      author: 'B. Logaaja',
      url: 'kotisivu'
    }
    await api
      .post('/api/blogs')
      .send(format(newBlog))
      .expect(200)
      .expect('Content-Type', /application\/json/)
    const response = await api
      .get('/api/blogs')
    expect(response.body[response.body.length-1].likes).toBe(0)
  })

  test('if blog post without title and url is added', async () => {
    const newBlog = {
      author: 'B. Logaaja'
    }
    await api
      .post('/api/blogs')
      .send(format(newBlog))
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })

  describe('deletion of a blog', async () => {
    let addedBlog
    beforeAll(async () => {
      addedBlog = new Blog({
        title: 'toinen blogi',
        author: 'B. Logaaja',
        url: 'kotisivu',
        likes: 7
      })
      await addedBlog.save()
    })
    test('delete succeeds wit proper status code', async () => {
      const blogsAtStart = await blogsInDb()
      await api
        .delete(`/api/blogs/${addedBlog._id}`)
        .expect(204)
      const blogsAfterOperation = await blogsInDb()
      const titles = blogsAfterOperation.map(r => r.title)
      expect(titles).not.toContain(addedBlog.title)
      expect(blogsAfterOperation.length).toBe(blogsAtStart - 1)
    })
  })

  describe('when there is initially one user at db', async () => {
    beforeAll(async () => {
      await User.remove({})
      const user = new User({ username: 'root', password: 'sekret' })
      await user.save()
    })

    test('POST /api/users succeeds with a fresh username', async () => {
      const usersBeforeOperation = await usersInDb()

      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const usersAfterOperation = await usersInDb()
      expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
      const usernames = usersAfterOperation.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    test('POST /api/users with invalid password', async () => {
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'sa'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    })

    test('POST /api/users with non-unique username', async () => {
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    })
  })

  afterAll(() => {
    server.close()
  })
})




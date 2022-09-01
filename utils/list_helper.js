const _ = require('lodash')
const User = require('../models/user')
const Blog = require('../models/blog')

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

const users = [
  {
    _id: '630e0f6ec9e0d67fe55c36c6',
    username: 'root',
    name: 'Superuser',
    password: 'pukinuki',
    __v: 0
  },
  {
    _id: '630e0f6ec9e0d67fe55c36c7',
    username: 'test1',
    name: 'Test user 1',
    password: 'test1',
    __v: 0
  },
  {
    _id: '630e0f6ec9e0d67fe55c36c8',
    username: 'test2',
    name: 'Test user 2',
    password: 'test2',
    __v: 0
  },
  {
    _id: '630e0f6ec9e0d67fe55c36c9',
    username: 'test3',
    name: 'Test user 3',
    password: 'test3',
    __v: 0
  }

]

const listWithOneBlog = [blogs[1]]

const listWithOneUser = [users[1]]

const dummy = (blogs) => {
  if (typeof blogs === 'object')
    return 1
  else
    return 0
}

const totalLikes = (blogs) => {
  if (blogs.length===0)
    return 0
  else return blogs.map(b => b.likes).reduce((a,b) => a+b)
}

const favoriteBlog = (blogs) => {
  if (blogs.length===0)
    return {}
  else {
    const blog = blogs.reduce((max,other) => max.likes >= other.likes ? max : other)
    delete blog.url
    return blog
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length===0)
    return {}
  else {
    let numBlogsAuthorGroups = _.groupBy(blogs, (b) => b.author)
    numBlogsAuthorGroups = _.toPairs(_.mapValues(numBlogsAuthorGroups, (value) => value.length))
    const mostBlogsAuthor = numBlogsAuthorGroups.reduce((max,other) => max[1] > other[1] ? max : other)
    return {
      author: mostBlogsAuthor[0],
      blogs: mostBlogsAuthor[1]
    }
  }
}

const mostLikesReducer = (value) => {
  const sumLikes = value.reduce((a,b) => {
    return { likes: a.likes + b.likes }
  }
  )
  return sumLikes.likes
}

const mostLikes = (blogs) => {
  if (blogs.length===0)
    return {}
  else {
    let numLikesAuthorGroups = _.groupBy(blogs, (b) => b.author)
    numLikesAuthorGroups = _.toPairs(_.mapValues(numLikesAuthorGroups, mostLikesReducer))
    const mostLikesAuthor = numLikesAuthorGroups.reduce((max,other) => max[1] > other[1] ? max : other)
    return {
      author: mostLikesAuthor[0],
      likes: mostLikesAuthor[1]
    }
  }
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(b => b.toJSON())
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  usersInDb,
  blogsInDb,
  listWithOneBlog,
  listWithOneUser,
  blogs,
  users
}
const listHelper = require('../utils/list_helper')

describe('author with most blogs', () => {
  test('of empty list is empty object', () => {
    const result = listHelper.mostBlogs([])
    expect(result).toEqual({})
  })

  test('when list has only one blog, equals the author of the blog itself and number of blogs is 1', () => {
    const result = listHelper.mostBlogs(listHelper.listWithOneBlog)
    const expectedResult = {
      author: 'Edsger W. Dijkstra',
      blogs: 1
    }
    expect(result).toEqual(expectedResult)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.mostBlogs(listHelper.blogs)
    const expectedResult = {
      author: 'Robert C. Martin',
      blogs: 3
    }
    expect(result).toEqual(expectedResult)
  })
})
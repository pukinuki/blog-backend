const listHelper = require('../utils/list_helper')

describe('author with most likes', () => {
  test('of empty list is empty object', () => {
    const result = listHelper.mostLikes([])
    expect(result).toEqual({})
  })

  test('when list has only one blog, equals the author of the blog itself and number of likes of the blog itself', () => {
    const result = listHelper.mostLikes(listHelper.listWithOneBlog)
    const expectedResult = {
      author: 'Edsger W. Dijkstra',
      likes: 5
    }
    expect(result).toEqual(expectedResult)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.mostLikes(listHelper.blogs)
    const expectedResult = {
      author: 'Edsger W. Dijkstra',
      likes: 17
    }
    expect(result).toEqual(expectedResult)
  })
})
const listHelper = require('../utils/list_helper')

describe('favortie blog', () => {
  test('of empty list is empty array', () => {
    const result = listHelper.favoriteBlog([])
    expect(result).toEqual({})
  })

  test('when list has only one blog, equals the blog itself', () => {
    const result = listHelper.favoriteBlog(listHelper.listWithOneBlog)
    const expectedResult = listHelper.listWithOneBlog[0]
    delete expectedResult.url
    expect(result).toEqual(expectedResult)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.favoriteBlog(listHelper.blogs)
    const expectedResult = listHelper.blogs[2] //Favorite blog
    delete expectedResult.url
    expect(result).toEqual(expectedResult)
  })
})
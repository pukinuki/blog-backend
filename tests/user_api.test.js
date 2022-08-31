const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const helper = require('../utils/list_helper')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHashList = []

  for (let i = 0; i < helper.users.length; i++) {
    passwordHashList[i] = await bcrypt.hash(helper.users[i].password, 10)
  }

  const userArrayCopy = helper.users.map(user => ({ ...user }))
  const userObjects = userArrayCopy.map((user, index) => {
    user['passwordHash'] = passwordHashList[index]
    delete user['password']
    return new User(user)
  })

  const promiseArray = userObjects.map(user => user.save())
  await Promise.all(promiseArray)
})

describe('Api users with initial database tests that', () => {

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('users with "username" already in database are not created and return message', async () => {
    const usersAtStart = await helper.usersInDb()

    const newInvalidUser = {
      username: 'test1',
      name: 'Test 1 already in database',
      password: 'test1',
    }

    const response = await api
      .post('/api/users')
      .send(newInvalidUser)
      .expect(400)

    expect(response.body.error).toContain('username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

  })

  test('users with invalid username are not created and return message', async () => {
    const usersAtStart = await helper.usersInDb()

    const newInvalidUser = {
      username: 'ff',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    const response = await api
      .post('/api/users')
      .send(newInvalidUser)
      .expect(400)

    expect(response.body.error).toContain('User validation failed: username')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

  })

  test('users with invalid password are not created and return message', async () => {
    const usersAtStart = await helper.usersInDb()

    const newInvalidUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'sa',
    }

    const response = await api
      .post('/api/users')
      .send(newInvalidUser)
      .expect(400)

    expect(response.body.error).toContain('password must be at least 3 characters long')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

  })

})

afterAll(() => {
  mongoose.connection.close()
})
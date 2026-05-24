const { expect, jest, test, describe } = require('@jest/globals')
const markets = require('./markets.js')

const axios = require('axios')
jest.mock('axios')

const fakeMarkets = [
  { name: 'London Stock Exchange', workingSchedules: [{ id: 1 }, { id: 2 }] },
  { name: 'New York Stock Exchange', workingSchedules: [{ id: 3 }] }
]

describe('getMarketByName', () => {
  test('returns matching markets', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: fakeMarkets }))

    const output = await markets.getMarketByName('London Stock Exchange')
    expect(output).toStrictEqual([fakeMarkets[0]])
  })
  test('returns empty array when no match', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: fakeMarkets }))

    const output = await markets.getMarketByName('Tokyo Stock Exchange')
    expect(output).toStrictEqual([])
  })
})

describe('getMarketById', () => {
  test('finds market by working schedule id', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: fakeMarkets }))

    const output = await markets.getMarketById(3)
    expect(output).toStrictEqual(fakeMarkets[1])
  })
  test('returns undefined when not found', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: fakeMarkets }))

    const output = await markets.getMarketById(99)
    expect(output).toBeUndefined()
  })
})

describe('rate limit retry', () => {
  test('retries on 429', async () => {
    global.setTimeout = jest.fn(cb => cb())
    jest.spyOn(global, 'setTimeout')

    axios.get
      .mockImplementationOnce(() => Promise.reject({ response: { status: 429 } })) // eslint-disable-line prefer-promise-reject-errors
      .mockImplementationOnce(() => Promise.resolve({ data: fakeMarkets }))

    const output = await markets.getMarkets()
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(output).toStrictEqual(fakeMarkets)
  })
})

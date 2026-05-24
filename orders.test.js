const { expect, jest, test, describe } = require('@jest/globals')
const orders = require('./orders.js')

const axios = require('axios')
jest.mock('axios')

const exampleOrder = {
  creationTime: '2019-08-24T14:15:22Z',
  filledQuantity: 0,
  filledValue: 0,
  id: 0,
  limitPrice: 0,
  quantity: 0,
  status: 'LOCAL',
  stopPrice: 0,
  strategy: 'QUANTITY',
  ticker: 'AAPL_US_EQ',
  type: 'LIMIT',
  value: 0
}

describe('market orders', () => {
  test('returns stuff on success', async () => {
    axios.post.mockImplementationOnce(() => Promise.resolve({ data: exampleOrder }))

    const output = await orders.placeMarketOrder('AAPL_US_EQ', 1)
    expect(output).toStrictEqual(exampleOrder)
  })
})
describe('limit orders', () => {
  test('returns stuff on success', async () => {
    axios.post.mockImplementationOnce(() => Promise.resolve({ data: exampleOrder }))

    const output = await orders.placeLimitOrder('AAPL_US_EQ', 1, 1)
    expect(output).toStrictEqual(exampleOrder)
  })
})
describe('placeOrder', () => {
  test('retries on 429', async () => {
    global.setTimeout = jest.fn(cb => cb())
    jest.spyOn(global, 'setTimeout')

    axios.post
      .mockImplementationOnce(() => Promise.reject({ response: { status: 429 } })) // eslint-disable-line prefer-promise-reject-errors
      .mockImplementationOnce(() => Promise.resolve({ data: exampleOrder }))

    const output = await orders.placeOrder('AAPL_US_EQ', 1)
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(output).toStrictEqual(exampleOrder)
  })
  test('throws immediately on min-value errors', async () => {
    const err = { response: { status: 400, data: { clarification: 'InsufficientFreeForStocksException', type: '/api-errors/min-value-exceeded' } } }
    axios.post.mockImplementationOnce(() => Promise.reject(err)) // eslint-disable-line prefer-promise-reject-errors

    await expect(orders.placeOrder('AAPL_US_EQ', 1)).rejects.toStrictEqual(err)
  })
  test('throws immediately on min-quantity errors', async () => {
    const err = { response: { status: 400, data: { clarification: 'InsufficientFreeForStocksException', type: '/api-errors/min-quantity-exceeded' } } }
    axios.post.mockImplementationOnce(() => Promise.reject(err)) // eslint-disable-line prefer-promise-reject-errors

    await expect(orders.placeOrder('AAPL_US_EQ', 1)).rejects.toStrictEqual(err)
  })
})
describe('describe orders', () => {
  test('returns stuff on success', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: exampleOrder }))

    const output = await orders.getOrder(0)
    expect(output).toStrictEqual(exampleOrder)
  })
  test('falls back to history on 404', async () => {
    const historicalOrder = { ...exampleOrder, parentOrder: 0 }
    axios.get
      .mockImplementationOnce(() => Promise.reject({ response: { status: 404 } })) // eslint-disable-line prefer-promise-reject-errors
      .mockImplementationOnce(() => Promise.resolve({ data: { items: [historicalOrder] } }))

    const output = await orders.getOrder(0)
    expect(output).toStrictEqual(historicalOrder)
  })
})
describe('order picker', () => {
  test('prioritises GBP', () => {
    const x = [
      { currencyCode: 'EUR', ticker: 'A' },
      { currencyCode: 'GBP', ticker: 'B' },
      { currencyCode: 'USD', ticker: 'C' }
    ]
    const instrument = orders.selectInstrument(x)
    expect(instrument.ticker).toBe('B')
  })
  test('prioritises USD', () => {
    const x = [
      { currencyCode: 'USD', ticker: 'A' },
      { currencyCode: 'JPY', ticker: 'B' },
      { currencyCode: 'EUR', ticker: 'C' }
    ]
    const instrument = orders.selectInstrument(x)
    expect(instrument.ticker).toBe('A')
  })
  test('picks oldest', () => {
    const x = [
      { currencyCode: 'CAD', ticker: 'A', addedOn: '2019-08-24T14:15:22Z' },
      { currencyCode: 'JPY', ticker: 'B', addedOn: '2021-03-01T12:00:33Z' },
      { currencyCode: 'EUR', ticker: 'C', addedOn: '2009-01-01T04:32:00Z' }
    ]
    const instrument = orders.selectInstrument(x)
    expect(instrument.ticker).toBe('C')
  })
})

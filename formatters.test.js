const { expect, test, describe, jest } = require('@jest/globals')
const formatters = require('./formatters.js')
const axios = require('axios')

jest.mock('axios')

describe('username formatting', () => {
  test('works with a username', () => {
    const user = { username: 'foo', firstName: 'bar', lastName: 'baz' }
    expect(formatters.formatUsername(user)).toBe('@foo')
  })
  test('works with a name name', () => {
    const user = { username: null, firstName: 'bar', lastName: 'baz' }
    expect(formatters.formatUsername(user)).toBe('bar baz')
  })
})
describe('underliner', () => {
  test('works at the start', () => {
    expect(
      formatters.underlineMessage('hello world', 'hello')
    ).toBe('<u>hello</u> world')
  })
  test('works at the end', () => {
    expect(
      formatters.underlineMessage('hello world', 'world')
    ).toBe('hello <u>world</u>')
  })
  test('works in the middle', () => {
    expect(
      formatters.underlineMessage('hello world', 'lo wor')
    ).toBe('hel<u>lo wor</u>ld')
  })
  test('underlines the first instance', () => {
    expect(
      formatters.underlineMessage('hello hello world', 'hello')
    ).toBe('<u>hello</u> hello world')
  })
  test('works when there\'s no match', () => {
    expect(
      formatters.underlineMessage('hello world', 'xyzzy')
    ).toBe('hello world')
  })
})
describe('order summary', () => {
  const fakeTicker = [{ ticker: 'XXX', currencyCode: 'GBP', workingScheduleId: 1 }]
  const fakeMarkets = [{ name: 'Test Exchange', workingSchedules: [{ id: 1 }] }]
  const mockCalls = () => {
    axios.get
      .mockImplementationOnce(() => Promise.resolve({ data: fakeTicker }))
      .mockImplementationOnce(() => Promise.resolve({ data: fakeMarkets }))
  }
  test('works on a new buy', async () => {
    mockCalls()
    const order = { quantity: 1, ticker: 'XXX', type: 'MARKET', status: 'NEW' }
    expect(await formatters.generateOrderSummary(order)).toBe(
      '<b>⏳ Buying</b> 1× <code>XXX</code> at next available price on the Test Exchange'
    )
  })
  test('works on a new sell', async () => {
    mockCalls()
    const order = { quantity: -1, ticker: 'XXX', type: 'MARKET', status: 'NEW' }
    expect(await formatters.generateOrderSummary(order)).toBe(
      '<b>⏳ Selling</b> 1× <code>XXX</code> at next available price on the Test Exchange'
    )
  })
  test('works on a new stop order', async () => {
    mockCalls()
    const order = { quantity: -1, ticker: 'XXX', type: 'STOP', status: 'NEW' }
    expect(await formatters.generateOrderSummary(order)).toBe(
      '<b>⏳ Selling</b> 1× <code>XXX</code> on the Test Exchange'
    )
  })
  test('works on a new limit order', async () => {
    mockCalls()
    const order = { quantity: -1, ticker: 'XXX', type: 'LIMIT', limitPrice: '5.00', status: 'NEW' }
    expect(await formatters.generateOrderSummary(order)).toBe(
      '<b>⏳ Selling</b> 1× <code>XXX</code> at <code>£5.00</code> or better on the Test Exchange'
    )
  })
  test('works on a new limit order in a non-default currency', async () => {
    const fakeTickerUsd = [{ ...fakeTicker[0], currencyCode: 'USD' }]
    axios.get
      .mockImplementationOnce(() => Promise.resolve({ data: fakeTickerUsd }))
      .mockImplementationOnce(() => Promise.resolve({ data: fakeMarkets }))
    const order = { quantity: -1, ticker: 'XXX', type: 'LIMIT', limitPrice: '5.00', status: 'NEW' }
    expect(await formatters.generateOrderSummary(order)).toBe(
      '<b>⏳ Selling</b> 1× <code>XXX</code> at <code>US$5.00</code> or better on the Test Exchange'
    )
  })
})

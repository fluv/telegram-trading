const { expect, test, describe, jest, beforeEach } = require('@jest/globals')

jest.mock('fs')
jest.mock('./config.js', () => ({ get: jest.fn() }))

const fs = require('fs')
const config = require('./config.js')
const logger = require('./logger.js')

describe('event handler imports', () => {
  test('EditedMessage is a constructor', () => {
    const { EditedMessage } = require('telegram/events/EditedMessage')
    expect(typeof EditedMessage).toBe('function')
    expect(() => new EditedMessage()).not.toThrow()
  })

  test('DeletedMessage is a constructor', () => {
    const { DeletedMessage } = require('telegram/events/DeletedMessage')
    expect(typeof DeletedMessage).toBe('function')
    expect(() => new DeletedMessage({})).not.toThrow()
  })
})

describe('logger', () => {
  let client

  beforeEach(() => {
    jest.clearAllMocks()
    client = { addEventHandler: jest.fn() }
    fs.createWriteStream.mockReturnValue({ write: jest.fn() })
  })

  test('does nothing when logging disabled', () => {
    config.get.mockReturnValue(false)
    logger(client)
    expect(client.addEventHandler).not.toHaveBeenCalled()
  })

  test('registers four handlers when logging enabled', () => {
    config.get.mockImplementation(key => {
      if (key === 'logging.jsonlEnabled') return true
      return '/tmp/test.jsonl'
    })
    logger(client)
    expect(client.addEventHandler).toHaveBeenCalledTimes(4)
  })
})

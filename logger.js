const { NewMessage, Raw } = require('telegram/events')
const { EditedMessage } = require('telegram/events/EditedMessage')
const { DeletedMessage } = require('telegram/events/DeletedMessage')
const { Api } = require('telegram')
const fs = require('fs')
const config = require('./config.js')

// telegram objects contain bigints; strip nulls to keep jsonl compact
const serialize = (obj) => JSON.stringify(obj, (k, v) => {
  if (typeof v === 'bigint') return v.toString()
  if (v === null) return undefined
  return v
})

module.exports = (client) => {
  if (!config.get('logging.jsonlEnabled')) return

  const stream = fs.createWriteStream(config.get('logging.jsonlFile'), { flags: 'a' })

  client.addEventHandler(async (event) => {
    const msg = event.message
    const sender = await msg.getSender()
    if (!sender || !sender.id) return
    const entry = {
      ev: 'msg',
      ts: new Date().toISOString(),
      sender,
      message: msg
    }
    stream.write(serialize(entry) + '\n')
  }, new NewMessage())

  client.addEventHandler(async (event) => {
    const msg = event.message
    const sender = await msg.getSender()
    const entry = {
      ev: 'msg_edit',
      ts: new Date().toISOString(),
      sender: sender || null,
      message: msg
    }
    stream.write(serialize(entry) + '\n')
  }, new EditedMessage())

  client.addEventHandler((event) => {
    const entry = {
      ev: 'msg_del',
      ts: new Date().toISOString(),
      msg_ids: event.deletedIds.map(id => id.toString()),
      peer: event.peer ? event.peer.toString() : null
    }
    stream.write(serialize(entry) + '\n')
  }, new DeletedMessage({}))

  // reactions — UpdateMessageReactions is MTProto-only; may not fire for all bot accounts
  client.addEventHandler((update) => {
    const entry = {
      ev: 'reaction',
      ts: new Date().toISOString(),
      update
    }
    stream.write(serialize(entry) + '\n')
  }, new Raw({ types: [Api.UpdateMessageReactions] }))
}

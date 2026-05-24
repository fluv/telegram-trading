const { NewMessage, MessageEdited, MessageDeleted, Raw } = require('telegram/events')
const { Api } = require('telegram')
const fs = require('fs')
const config = require('./config.js')

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
      sender: { id: sender.id.toString(), username: sender.username || null, firstName: sender.firstName || null },
      message: msg
    }
    stream.write(JSON.stringify(entry, (k, v) => typeof v === 'bigint' ? v.toString() : v) + '\n')
  }, new NewMessage())

  client.addEventHandler(async (event) => {
    const msg = event.message
    const sender = await msg.getSender()
    const entry = {
      ev: 'msg_edit',
      ts: new Date().toISOString(),
      sender: sender ? { id: sender.id.toString(), username: sender.username || null, firstName: sender.firstName || null } : null,
      message: msg
    }
    stream.write(JSON.stringify(entry, (k, v) => typeof v === 'bigint' ? v.toString() : v) + '\n')
  }, new MessageEdited())

  client.addEventHandler((event) => {
    const entry = {
      ev: 'msg_del',
      ts: new Date().toISOString(),
      msg_ids: event.deletedIds.map(id => id.toString()),
      peer: event.peer ? event.peer.toString() : null
    }
    stream.write(JSON.stringify(entry, (k, v) => typeof v === 'bigint' ? v.toString() : v) + '\n')
  }, new MessageDeleted())

  // reactions — UpdateMessageReactions is MTProto-only; may not fire for all bot accounts
  client.addEventHandler((update) => {
    const entry = {
      ev: 'reaction',
      ts: new Date().toISOString(),
      update
    }
    stream.write(JSON.stringify(entry, (k, v) => typeof v === 'bigint' ? v.toString() : v) + '\n')
  }, new Raw({ types: [Api.UpdateMessageReactions] }))
}

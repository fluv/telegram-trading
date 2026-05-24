const { NewMessage, MessageEdited, MessageDeleted, Raw } = require('telegram/events')
const { Api } = require('telegram')
const fs = require('fs')
const config = require('./config.js')

const stream = fs.createWriteStream(config.get('logging.jsonlFile'), { flags: 'a' })

const bigint = (k, v) => typeof v === 'bigint' ? v.toString() : v

const write = (obj) => {
  if (!config.get('logging.jsonlEnabled')) return
  stream.write(JSON.stringify(obj, bigint) + '\n')
}

const senderSnap = (s) => s ? { id: s.id.toString(), username: s.username || null, first_name: s.firstName || null } : null

module.exports = (client) => {
  client.addEventHandler(async (event) => {
    const msg = event.message
    const s = await msg.getSender()
    if (!s || !s.id) return
    write({ ev: 'msg', ts: new Date().toISOString(), sender: senderSnap(s), message: msg })
  }, new NewMessage())

  client.addEventHandler(async (event) => {
    write({ ev: 'msg_edit', ts: new Date().toISOString(), message: event.message })
  }, new MessageEdited())

  client.addEventHandler((event) => {
    write({ ev: 'msg_del', ts: new Date().toISOString(), msg_ids: event.deletedIds.map(String), peer: event.peer ? event.peer.toString() : null })
  }, new MessageDeleted())

  // reactions — UpdateMessageReactions is MTProto-only; may not fire for all bot accounts
  client.addEventHandler((update) => {
    write({ ev: 'reaction', ts: new Date().toISOString(), update })
  }, new Raw({ types: [Api.UpdateMessageReactions] }))
}

const { NewMessage, MessageEdited, MessageDeleted, Raw } = require('telegram/events')
const { Api } = require('telegram')
const fs = require('fs')
const config = require('./config.js')

const replaceBigInt = (k, v) => typeof v === 'bigint' ? v.toString() : v

module.exports = (client) => {
  if (!config.get('logging.jsonlEnabled')) return

  const stream = fs.createWriteStream(config.get('logging.jsonlFile'), { flags: 'a' })

  client.addEventHandler(async (event) => {
    const msg = event.message
    const s = await msg.getSender()
    if (!s || !s.id) return
    stream.write(JSON.stringify({ ev: 'msg', ts: new Date().toISOString(), sender: { id: s.id.toString(), username: s.username || null, firstName: s.firstName || null }, message: msg }, replaceBigInt) + '\n')
  }, new NewMessage())

  client.addEventHandler(async (event) => {
    const msg = event.message
    const s = await msg.getSender()
    stream.write(JSON.stringify({ ev: 'msg_edit', ts: new Date().toISOString(), sender: s ? { id: s.id.toString(), username: s.username || null, firstName: s.firstName || null } : null, message: msg }, replaceBigInt) + '\n')
  }, new MessageEdited())

  client.addEventHandler((event) => {
    stream.write(JSON.stringify({ ev: 'msg_del', ts: new Date().toISOString(), msg_ids: event.deletedIds.map(String), peer: event.peer ? event.peer.toString() : null }, replaceBigInt) + '\n')
  }, new MessageDeleted())

  // reactions — UpdateMessageReactions is MTProto-only; may not fire for all bot accounts
  client.addEventHandler((update) => {
    stream.write(JSON.stringify({ ev: 'reaction', ts: new Date().toISOString(), update }, replaceBigInt) + '\n')
  }, new Raw({ types: [Api.UpdateMessageReactions] }))
}

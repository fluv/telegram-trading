const { NewMessage, MessageEdited, MessageDeleted, Raw } = require('telegram/events')
const { Api } = require('telegram')
const fs = require('fs')
const config = require('./config.js')

const stream = fs.createWriteStream(config.get('logging.jsonlFile'), { flags: 'a' })

const write = (obj) => {
  if (!config.get('logging.jsonlEnabled')) return
  stream.write(JSON.stringify({ _v: 1, ts: new Date().toISOString(), ...obj }) + '\n')
}

const extractSender = (s) => ({
  user_id: s.id ? s.id.toString() : null,
  username: s.username || null,
  first_name: s.firstName || null
})

const stickerAttribs = (doc) => {
  const attrs = doc.attributes || []
  const sticker = attrs.find(a => a.className === 'DocumentAttributeSticker')
  return {
    emoji: sticker ? sticker.alt : null,
    set_id: sticker && sticker.stickerset ? sticker.stickerset.id.toString() : null,
    animated: doc.mimeType === 'application/x-tgsticker',
    video: doc.mimeType === 'video/webm'
  }
}

const extractContent = (msg) => {
  const base = {
    msg_id: msg.id,
    chat_id: msg.chatId ? msg.chatId.toString() : null,
    reply_to_msg_id: msg.replyToMsgId || null,
    fwd_from: !!msg.fwdFrom,
    via_bot_id: msg.viaBotId ? msg.viaBotId.toString() : null
  }

  if (msg.sticker) return { ...base, ctype: 'sticker', sticker: stickerAttribs(msg.sticker) }
  if (msg.poll) {
    return {
      ...base,
      ctype: 'poll',
      poll_question: msg.poll.poll && msg.poll.poll.question ? msg.poll.poll.question.text : null,
      poll_options: (msg.poll.poll ? msg.poll.poll.answers : []).map(a => a.text ? a.text.text : null)
    }
  }
  if (msg.dice) return { ...base, ctype: 'dice', dice_emoji: msg.dice.emoticon, dice_value: msg.dice.value }
  if (msg.photo) return { ...base, ctype: 'photo', caption: msg.message || null }
  if (msg.video) return { ...base, ctype: 'video', caption: msg.message || null }
  if (msg.voice) return { ...base, ctype: 'voice' }
  if (msg.videoNote) return { ...base, ctype: 'video_note' }
  if (msg.audio) return { ...base, ctype: 'audio', caption: msg.message || null }
  if (msg.document) return { ...base, ctype: 'document', caption: msg.message || null }
  if (msg.contact) return { ...base, ctype: 'contact' }
  if (msg.location) return { ...base, ctype: 'location' }
  if (msg.game) return { ...base, ctype: 'game', game_title: msg.game.title || null }

  return {
    ...base,
    ctype: 'text',
    text: msg.message,
    entities: (msg.entities || []).map(e => ({
      type: e.className,
      offset: e.offset,
      length: e.length,
      ...(e.url ? { url: e.url } : {}),
      ...(e.userId ? { user_id: e.userId.toString() } : {})
    }))
  }
}

module.exports = (client) => {
  client.addEventHandler(async (event) => {
    const msg = event.message
    const s = await msg.getSender()
    if (!s || !s.id) return
    write({ ev: 'msg', ...extractSender(s), ...extractContent(msg) })
  }, new NewMessage())

  client.addEventHandler(async (event) => {
    const msg = event.message
    write({
      ev: 'msg_edit',
      msg_id: msg.id,
      chat_id: msg.chatId ? msg.chatId.toString() : null,
      text: msg.message || null,
      edit_date: msg.editDate ? new Date(msg.editDate * 1000).toISOString() : null
    })
  }, new MessageEdited())

  client.addEventHandler((event) => {
    write({
      ev: 'msg_del',
      msg_ids: event.deletedIds,
      chat_id: event.peer ? event.peer.toString() : null
    })
  }, new MessageDeleted())

  // reactions — UpdateMessageReactions is MTProto-only; may not fire for all bot accounts
  client.addEventHandler((update) => {
    write({
      ev: 'reaction',
      msg_id: update.msgId,
      chat_id: update.peer ? update.peer.toString() : null,
      reactions: (update.reactions && update.reactions.results ? update.reactions.results : []).map(r => ({
        emoji: r.reaction ? r.reaction.emoticon : null,
        count: r.count
      }))
    })
  }, new Raw({ types: [Api.UpdateMessageReactions] }))
}

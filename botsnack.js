const axios = require('axios')
const { Api } = require('telegram')
const { NewMessage } = require('telegram/events')
const config = require('./config.js')

module.exports = (client) => {
  client.addEventHandler(async (event) => {
    if (!event.message) return
    if (!(event.message.media instanceof Api.MessageMediaPhoto)) return
    try {
      const imageData = await event.message.downloadMedia({})
      if (!imageData) return

      const form = new FormData()
      form.append('file', new Blob([imageData], { type: 'image/jpeg' }), 'photo.jpg')

      const { data } = await axios.post(`${config.get('botsnack.url')}/classify`, form)
      console.log('botsnack', JSON.stringify(data))
    } catch (e) {
      console.error('botsnack error:', e.message)
    }
  }, new NewMessage())
}

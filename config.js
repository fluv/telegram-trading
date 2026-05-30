const convict = require('convict')

const isBase64 = (value) => {
  try {
    /* global aotb */
    aotb(value)
    return true
  } catch (e) {
    return false
  }
}

const config = convict({
  logging: {
    enabled: {
      doc: 'Whether to enable logging messages to a log, IRC style',
      default: false,
      format: Boolean,
      env: 'LOGGING_ENABLED'
    },
    file: {
      doc: 'Which file to log to',
      default: '/data/trashzone.log',
      format: String,
      env: 'LOGGING_FILE'
    },
    jsonlEnabled: {
      doc: 'Whether to enable JSONL event logging',
      default: false,
      format: Boolean,
      env: 'LOGGING_JSONL_ENABLED'
    },
    jsonlFile: {
      doc: 'Which file to write JSONL events to',
      default: '/data/trashzone.jsonl',
      format: String,
      env: 'LOGGING_JSONL_FILE'
    }
  },
  env: {
    doc: 'The application environment',
    default: 'development',
    env: 'NODE_ENV'
  },
  trading212: {
    env: {
      doc: 'The Trading212 endpoint to use',
      format: ['demo', 'live'],
      default: 'demo'
    },
    apiKey: {
      doc: 'The Trading212 API key to use',
      default: undefined,
      format: isBase64,
      env: 'TRADING212_API_KEY'
    }
  },
  telegram: {
    enabled: {
      default: true,
      format: Boolean
    },
    apiId: {
      doc: 'Telegram API creds -- get this from my.telegram.org',
      format: Number,
      default: undefined,
      env: 'TELEGRAM_API_ID'
    },
    apiHash: {
      doc: 'Telegram API creds -- get this from my.telegram.org',
      format: String,
      default: undefined,
      env: 'TELEGRAM_API_HASH'
    },
    botToken: {
      doc: 'Telegram bot token -- get this from t.me/BotFather',
      format: String,
      default: undefined,
      env: 'TELEGRAM_BOT_TOKEN'
    },
    heartbeatInterval: {
      doc: 'Number of milliseconds to re-connect to Telegram',
      format: Number,
      default: 30000
    },
    stringSession: {
      doc: 'The session token used to log in the second time onwards',
      format: isBase64,
      default: '',
      env: 'TELEGRAM_STRING_SESSION'
    },
    logLevel: {
      doc: 'The log level of the internal Telegram library',
      format: ['none', 'error', 'warn', 'info', 'debug'],
      default: 'info',
      env: 'TELEGRAM_LOG_LEVEL'
    },
    inviteLink: {
      format: String,
      default: undefined,
      env: 'TELEGRAM_INVITE_LINK'
    }
  },
  sentiment: {
    language: {
      doc: 'The language of the messages to analyse: see https://naturalnode.github.io/natural/stemmers.html',
      format: String,
      default: 'English'
    },
    vocabulary: {
      doc: 'The sentiment analysis vocabulary to use: see https://naturalnode.github.io/natural/sentiment_analysis.html',
      format: ['afinn', 'senticon', 'pattern'],
      default: 'afinn'
    }
  },
  transactions: {
    excludedSecurities: {
      doc: 'Securities to never attempt to buy',
      format: Array,
      default: [
        'NICE_US_EQ',
        'ONON_US_EQ'
      ]
    },
    reportingChannel: {
      format: Number,
      default: -1002122625485,
      env: 'TELEGRAM_REPORTING_CHANNEL'
    },
    sentimentThreshold: {
      doc: 'The strength of sentiment analysis under which to ignore messages',
      format: Number,
      default: 0.2,
      env: 'SENTIMENT_THRESHOLD'
    },
    gbxConversion: {
      doc: 'The factor of which to multiply quantities of GBX transactions by',
      format: Number,
      default: 1,
      env: 'GBX_CONVERSION'
    },
    defaultExpiry: {
      doc: 'The type of expiry to set on limit orders unless otherwise specified',
      format: [
        'GTC', // Good 'Til Cancelled
        'DAY' // End of trading day
      ],
      default: 'DAY'
    },
    flipMultiplier: {
      format: Number,
      doc: 'Minimum multipler above average buy price to set sell limit orders at',
      default: 0.0025
    },
    onlySellIfProfitable: {
      format: Boolean,
      doc: 'Whether to force all sell orders to be above the average price we bought for',
      default: false
    },
    retryFactor: {
      format: Number,
      doc: 'How much to divide the quantity by when retrying due to lack of funds',
      default: 2
    }
  },
  webserver: {
    port: {
      format: Number,
      default: 3000,
      env: 'PORT'
    }
  },
  botsnack: {
    url: {
      doc: 'URL of the botsnack classifier service',
      format: String,
      default: 'http://botsnack:8000',
      env: 'BOTSNACK_URL'
    }
  }
})

const env = config.get('env')
if (env !== 'production') {
  config.loadFile(`${env}.json`)
}
config.validate({ allowed: 'strict' })

module.exports = config

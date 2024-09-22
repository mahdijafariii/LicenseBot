const dotenv = require('dotenv')
const env = dotenv.config().parsed
const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')

const bot = new Telegraf(env.BOT_TOKEN)
bot.start((ctx) => ctx.reply('Welcome'))

bot.launch()

const dotenv = require('dotenv')
const env = dotenv.config().parsed
const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
const knex = require("./config/db");

const bot = new Telegraf(env.BOT_TOKEN)
bot.start(async (ctx) => {
    const hasUser = await knex("users").where({chatId : ctx.chat.id}).first();
    if(!hasUser) await knex("users").insert({chatId : ctx.chat.id ,name : ctx.chat.first_name })

    ctx.reply("Hello welcome to sell license bot 💓")

})

bot.launch()

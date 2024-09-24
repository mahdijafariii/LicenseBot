const dotenv = require('dotenv')
const env = dotenv.config().parsed
const { Telegraf, Markup} = require('telegraf')
const { message } = require('telegraf/filters')
const knex = require("./config/db");
const redis = require("redis")
const client = redis.createClient();
client.connect();

const bot = new Telegraf(env.BOT_TOKEN)
bot.start(async (ctx) => {
    const hasUser = await knex("users").where({chatId : ctx.chat.id}).first();
    if(!hasUser) await knex("users").insert({chatId : ctx.chat.id ,name : ctx.chat.first_name })

    ctx.reply("Hello welcome to sell license bot 💓",
        Markup.inlineKeyboard([
            Markup.button.callback("Buy license🪙","shop")
        ])
        )

})

bot.action("shop",async (ctx) =>{
    const getRandomLicense = await knex("license").orderByRaw("RAND()").where({status : "set"}).limit(1).first()
    if(getRandomLicense){
        ctx.reply(getRandomLicense.license_key)
        const updateLicense = await knex("license").where({id : getRandomLicense.id}).update({status : "use"})
    }
    else {
        ctx.reply("licensed finished !!")
    }
})

bot.command("admin" , async (ctx)=>{
    const chatId = ctx.chat.id;
    const user = await knex("users").where({chatId  : chatId , role : "admin"}).first();
    if (user){
        const creatAdmin = client.set(`admin:${chatId}`, "verify" , {EX : 60})
        ctx.reply("Enter your password please (30 second ⌛)!")
    }
})

bot.command("set_config" , async (ctx)=>{
    const chatId = ctx.chat.id;
    const message = ctx.update.message.text.replace("/set_config ", "");
    const isAdmin = await client.get(`admin:login:${chatId}`)
    if (isAdmin){
        const addNewLicense = await knex("license").insert({license_key: message})
        ctx.reply("license added successfully ! 🍂")
    }
})
bot.on("text", async (ctx) =>{
    const chatId = ctx.update.message.chat.id;
    const message = ctx.update.message.text;

    const hasPassword = await client.get(`admin:${chatId}`)
    if (hasPassword){
        const validatePassword = await knex("admin-passwords").where({ password : message}).first();
        if (validatePassword){
            client.set(`admin:login:${chatId}`, "true" , {EX : 604800})
            ctx.reply("You login successfully 🌿")
        }
        else{
            ctx.reply("Your Password is incorrect ! ")
        }
    }
})



bot.launch()

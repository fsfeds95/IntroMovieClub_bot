const BOT_TOKEN = '7299943772:AAGtB60BK_9GY43LcotfNNSRy0qxB1CzPZQ';

const { Telegraf } = require('telegraf');

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';

 ctx.reply(`¡Hola ${firstName}, este es tu usuario ${username}!`);
});

bot.on('text', (ctx) => {
 ctx.reply('' + ctx.message.text);
});

bot.launch();
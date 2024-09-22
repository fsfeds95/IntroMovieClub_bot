const BOT_TOKEN = '7299943772:AAFMZ8yI9RVwpG9GNXQBpZsMJTRW0S05kCM';

const { Telegraf } = require('telegraf');

const bot = new Telegraf(BOT_TOKEN);

bot.on('text', (ctx) => {
    ctx.reply(ctx.message.text);
});

bot.launch();
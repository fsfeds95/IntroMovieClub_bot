const { Telegraf } = require('telegraf');

const BOT_TOKEN = '7799058013:AAE-HjGVOt5AbOKfdR-KGL66reWhdADPgn8';

const { Telegraf } = require('telegraf');

const bot = new Telegraf('BOT_TOKEN');

bot.on('text', (ctx) => {
    ctx.reply(ctx.message.text);
});

bot.launch();

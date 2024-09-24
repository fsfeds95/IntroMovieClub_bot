// Importar las bibliotecas requeridas
const express = require('express');

// Crea una aplicación en Express
const app = express();
const port = 8225;


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

//=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=\\

// Ruta "/keep-alive"
app.get('/keep-alive', (req, res) => {
 // Aquí puedes hacer algo simple, como enviar una respuesta vacía
 res.send('');
});

// Iniciar el servidor en el puerto 8225
app.listen(port, () => {
 console.log(`Servidor iniciado en http://localhost:${port}`);

 // Código del cliente para mantener la conexión activa
 setInterval(() => {
  fetch(`http://localhost:${port}/keep-alive`)
   .then(response => {
    const currentDate = new Date();
    const formattedTime = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()} - ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
    console.log(`Sigo vivo 🎉 (${formattedTime})`);
   })
   .catch(error => {
    console.error('Error en la solicitud de keep-alive:', error);
   });
 }, 5 * 60 * 1000); // 30 minutos * 60 segundos * 1000 milisegundos
});
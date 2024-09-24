// Importar las bibliotecas requeridas
const express = require('express');
const jimp = require('jimp-compact');

// Crea una aplicación en Express
const app = express();
const port = 8225;


const { Telegraf } = require('telegraf');

const BOT_TOKEN = '7299943772:AAGtB60BK_9GY43LcotfNNSRy0qxB1CzPZQ';
const bot = new Telegraf(BOT_TOKEN);


bot.start((ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';

 ctx.reply(`¡Hola ${firstName}, este es tu usuario ${username}!`);
});

bot.on('text', (ctx) => {
 ctx.reply('' + ctx.message.text);
});

bot.on('sticker', (ctx) => {
 ctx.reply('Formato no válido');
});

bot.on('voice', (ctx) => {
 ctx.reply('Formato no válido');
});

bot.on('audio', (ctx) => {
 ctx.reply('Formato no válido');
});

bot.command('backdrop', async (ctx) => {
 const repliedMessage = ctx.message.reply_to_message;

 if (repliedMessage && repliedMessage.photo) {
  const photo = repliedMessage.photo[repliedMessage.photo.length - 1]; // Obtiene la última foto respondida

  try {
   const imageUrl = await ctx.telegram.getFileLink(photo.file_id);
   const image = await Jimp.read(imageUrl);

   // Redimensionar la imagen usando RESIZE_MAGPHASE
   image.resize(1280, 720, jimp.RESIZE_MAGPHASE);

   // Cargar las marcas de agua
   const watermark1 = await jimp.read('./img/b/Wtxt-Backdrop.png');
   const watermark2 = await jimp.read('./img/b/Wlogo-Backdrop.png');

   // Escala la marca de agua a 1280px de ancho por 720px de alto
   watermark1.resize(1280, 720);
   watermark2.resize(1280, 720);

   // Establece la opacidad de la watermark1 a 0.375 y watermark2 a 0.75
   watermark1.opacity(0.08);
   watermark2.opacity(0.40);

   // Combinar las marcas de agua en una sola imagen
   watermark1.composite(watermark2, 0, 0, {
    mode: jimp.BLEND_SOURCE_OVER,
    opacitySource: 1.0,
    opacityDest: 1.0
   });

   // Aplicar la marca de agua a la imagen
   image.composite(watermark1, 0, 0, {
    mode: jimp.BLEND_SOURCE_OVER,
    opacitySource: 1.0,
    opacityDest: 1.0
   });

   // Guardar la imagen en formato WEBP con calidad al 100%
   image.quality(100).scale(1);

   const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

   ctx.replyWithPhoto({ source: buffer });
  } catch (error) {
   console.log(error);
   ctx.reply('Hubo un error al agregar la marca de agua a la imagen.');
  }
 } else {
  ctx.reply('Por favor, responde a una imagen para agregarle una marca de agua utilizando el comando /backdrop.');
 }
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
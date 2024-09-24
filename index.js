// Importar las bibliotecas requeridas
const express = require('express');
const jimp = require('jimp-compact');

// Crea una aplicación en Express
const app = express();
const port = 8225;


// Importar la biblioteca telegraf
const { Telegraf } = require('telegraf');
// el API TIKEN del bot
const BOT_TOKEN = '7299943772:AAGd7Aakc1Ho4_3QPpz9ZNCx7QiS5IEzw-g';
const bot = new Telegraf(BOT_TOKEN);


bot.start((ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';

 ctx.reply(`¡Hola ${firstName}, este es tu usuario ${username}!`);
});

bot.command('backdrop', async (ctx) => {
 const repliedMessage = ctx.message.reply_to_message;

 if (repliedMessage && repliedMessage.photo) {
  const photo = repliedMessage.photo[repliedMessage.photo.length - 1]; // Obtiene la última foto respondida

  try {
   const imageUrl = await ctx.telegram.getFileLink(photo.file_id);
   const image = await jimp.read(imageUrl);

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

   const buffer = await image.getBufferAsync(jimp.MIME_JPEG);

   ctx.replyWithPhoto({ source: buffer });
  } catch (error) {
   console.log(error);
   ctx.reply('Hubo un error al agregar la marca de agua a la imagen.');
  }
 } else {
  ctx.reply('Por favor, responde a una imagen para agregarle una marca de agua utilizando el comando /backdrop.');
 }
});

// Responde cuando alguien usa el comando /marca
bot.command('marca', async (ctx) => {
 if (ctx.message.reply_to_message && ctx.message.reply_to_message.photo) {
  const photoId = ctx.message.reply_to_message.photo[0].file_id;

  try {
   const file = await ctx.telegram.getFile(photoId);
   const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

   const image = await jimp.read(fileUrl);
   const font = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);

   // Calcula la posición para la esquina inferior derecha
   const text = 'bot';
   const textWidth = jimp.measureText(font, text);
   const textHeight = jimp.measureTextHeight(font, text, image.bitmap.width);
   // 10 píxeles de margen
   const x = image.bitmap.width - textWidth - 10;
   // 10 píxeles de margen
   const y = image.bitmap.height - textHeight - 10;

   // Aplica la marca de agua sin cambiar la calidad
   image.print(font, x, y, text);
   const buffer = await image.getBufferAsync(jimp.MIME_JPEG);

   // Responde con la imagen original y la marca de agua
   ctx.replyWithPhoto({ source: buffer });
  } catch (error) {
   console.log(error);
   ctx.reply('Hubo un error al agregar la marca de agua a la imagen.');
  }
 } else {
  ctx.reply("¡Responde a una imagen con el comando /marca!");
 }
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

bot.on('photo', (ctx) => {
 const photoId = ctx.message.photo[0].file_id;
 ctx.telegram.getFile(photoId).then(file => {
  const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
  // Envia la url a la consola
  console.log(fileUrl);
  // Envía la url al chat
  ctx.reply(fileUrl);
  // Envía la imagen en su resolución original al chat
  ctx.replyWithPhoto(photoId, { caption: "¡Mira esta imagen!" });
 });
});

// Responde cuando alguien responde a la imagen
bot.on('reply_to_message', (ctx) => {
 if (ctx.message.reply_to_message.photo) {
  ctx.reply("¡Gracias por tu respuesta! ¿Qué te parece la imagen?");
 }
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
    const currentDate = new Date().toLocaleString("es-VE", { timeZone: "America/Caracas" });
    const formattedTime = currentDate;
    console.log(`Sigo vivo 🎉 (${formattedTime})`);
   })
   .catch(error => {
    console.error('Error en la solicitud de keep-alive:', error);
   });
 }, 5 * 60 * 1000); // 30 minutos * 60 segundos * 1000 milisegundos
});
// Importar las bibliotecas requeridas
const express = require('express');
// Crea una aplicación en Express
const app = express();
const port = 8225;
// Importar la biblioteca telegraf
const { Telegraf } = require('telegraf');
// Importar las bibliotecas requeridas
const jimp = require('jimp-compact');

// el API TOKEN del bot
const BOT_TOKEN = '7299943772:AAEpcwT3s80SGmvfqgK4Rr3cwTrrVDuFJQc';
const bot = new Telegraf(BOT_TOKEN);

const userIds = []; // Array para almacenar los IDs de los usuarios
const ADMIN_ID = '-6839704393'; // Reemplaza esto con el ID del administrador

// Respuesta de Bienvenida al comando /start
bot.start((ctx) => {
 const userId = ctx.from.id;
 if (!userIds.includes(userId)) {
  userIds.push(userId); // Agregar el ID si no está ya en el array
 }

 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';

 ctx.reply(`¡Hola ${firstName}, este es tu usuario ${username}!`);
});

// Comando para el administrador
bot.command('todos', (ctx) => {
 if (ctx.from.id === ADMIN_ID) { // Verificar si es el administrador
  const message = ctx.message.text.split(' ').slice(1).join(' ');
  userIds.forEach(userId => {
   ctx.telegram.sendMessage(userId, message);
  });
  ctx.reply('¡Mensaje enviado a todos los usuarios!');
 } else {
  ctx.reply('¡No tienes permiso para usar este comando! 😏');
 }
});

// Responde cuando alguien usa el comando /backdrop
bot.command('backdrop', async (ctx) => {
 const waitMessage = await ctx.reply('Espere un momento...');

 if (ctx.message.reply_to_message && ctx.message.reply_to_message.photo) {
  const photoId = ctx.message.reply_to_message.photo[3].file_id;

  try {
   const file = await ctx.telegram.getFile(photoId);
   const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

   const image = await jimp.read(fileUrl);

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

   // Guardar la imagen con la calidad al 100%
   image.quality(100).scale(1);

   const buffer = await image.getBufferAsync(jimp.MIME_JPEG);

   // Responde con la imagen original y la marca de agua
   ctx.replyWithPhoto({ source: buffer }, { caption: "¡Tu imagen con marca de agua!" });

   // Elimina el mensaje de espera
   await ctx.deleteMessage(waitMessage.message_id);
  } catch (error) {
   console.log(error);
   ctx.reply('Hubo un error al agregar la marca de agua a la imagen.');

   // Elimina el mensaje de espera
   await ctx.deleteMessage(waitMessage.message_id);
  }
 } else {
  ctx.reply('Por favor, responde a una imagen con /backdrop para agregarle una marca de agua a la imagen.');

  // Elimina el mensaje de espera
  await ctx.deleteMessage(waitMessage.message_id);
 }
});

// Responde cuando alguien usa el comando /marca
bot.command('marca', async (ctx) => {
 const waitMessage = await ctx.reply('Espere un momento...');

 if (ctx.message.reply_to_message && ctx.message.reply_to_message.photo) {
  const photoId = ctx.message.reply_to_message.photo[3].file_id;

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

   // Aplica la marca de agua
   image.print(font, x, y, text);
   const buffer = await image.getBufferAsync(jimp.MIME_JPEG);

   // Responde con la imagen original y la marca de agua
   ctx.replyWithPhoto({ source: buffer }, { caption: "¡Tu imagen con marca de agua!" });

   // Elimina el mensaje de espera
   await ctx.deleteMessage(waitMessage.message_id);
  } catch (error) {
   console.log(error);
   ctx.reply('Hubo un error al agregar la marca de agua a la imagen.');

   // Elimina el mensaje de espera
   await ctx.deleteMessage(waitMessage.message_id);
  }
 } else {
  ctx.reply("¡Responde a una imagen con el comando /marca!");

  // Elimina el mensaje de espera
  await ctx.deleteMessage(waitMessage.message_id);
 }
});

// Ve los stickers
bot.on('sticker', (ctx) => {
 ctx.reply('Formato no válido');
});

// Ve los voice
bot.on('voice', (ctx) => {
 ctx.reply('Formato no válido');
});

// Ve los audios
bot.on('audio', (ctx) => {
 ctx.reply('Formato no válido');
});

// Ve los fotos
bot.on('photo', (ctx) => {
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 // Envía la url al chat
 ctx.reply(`¡Imagen recibida! gracias por enviala ${firstName}\n\nPuedes usar:\n\n/backdrop para hacer una marca de agua.`);
});

// Responde cuando alguien responde a la imagen
bot.on('reply_to_message', (ctx) => {
 if (ctx.message.reply_to_message.photo) {
  ctx.reply("¡Gracias por tu respuesta! ¿Qué te parece la imagen?");
 }
});

// Repite todo lo que le escribas
bot.on('text', (ctx) => {

 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 
 
 console.log(`"Nombre: ${firstName}, Usuario: ${username}, Dijo : ` + ctx.message.text) + ` "`;
 
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
 }, 0 * 30 * 0000); // 0 minutos * 30 segundos * 0000 milisegundos
});
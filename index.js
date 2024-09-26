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
const BOT_TOKEN = '7299943772:AAFxjPMsL27ORMkCaOGF_H4aSyE5SosEIFE';
const bot = new Telegraf(BOT_TOKEN);

// Array para almacenar los IDs de los usuarios
const userIds = [];



//=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=\\
//                        COMANDOS                       \\

// Respuesta de Bienvenida al comando /start
bot.start((ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /start"`);

 if (!userIds.includes(userId)) {
  // Agregar el ID si no está ya en el array
  userIds.push(userId);
 }

 ctx.reply(`¡Hola ${firstName}, este es tu usuario ${username}!`);
});


// Comando para el administrador
bot.command('todos', (ctx) => {
 // Reemplaza esto con el ID del administrador
 const ADMIN_ID = '6839704393';
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /todos"`);

 // Verificar si es el administrador
 if (ctx.from.id === ADMIN_ID) {
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
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /backdrop"`);

 const waitMessage = await ctx.reply(`Espere un momento ${firstName}...`);

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
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /marca"`);

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

//=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=\\
//                        EVENTOS                        \\

// Ve los voice
bot.on('voice', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un voice"`);

 ctx.reply('Formato no válido');
});

// Ve los fotos
bot.on('photo', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio una foto"`);

 // Envía la url al chat
 ctx.reply(`¡Imagen recibida! gracias por enviala ${firstName}\nPuedes usar:\n/backdrop para hacer una marca de agua.`);
});

// Ve los videos
bot.on('video', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un video"`);

 ctx.reply('¡Has enviado un video!');
});

// Ve los documentos
bot.on('document', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un documento"`);

 ctx.reply('¡Has enviado un documento!');
});

// Ve los audios
bot.on('audio', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un audio"`);

 ctx.reply('¡Has enviado un audio!');
});

// Para otros tipos de archivos
bot.on('message', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un tipo de archivo no valido"`);

 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido. Por favor, intenta enviar una imagen, video, documento o audio en su lugar. ¡Gracias!');
});

// Responde cuando alguien responde a la imagen
bot.on('reply_to_message', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} respondio a una imagen"`);

 if (ctx.message.reply_to_message.photo) {
  ctx.reply("¡Gracias por tu respuesta! ¿Qué te parece la imagen?");
 }
});

// Ve los stickers
bot.on('sticker', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un stickers"`);

 ctx.reply('Formato no válido');
});

// Repite todoo lo que le escribas
bot.on('text', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un texto"`);

 ctx.reply('' + ctx.message.text);
});

//=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=\\

bot.launch();

//=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=\\

// Ruta "/keep-alive"
app.get('/keep-alive', (req, res) => {
 // Enviar una respuesta vacía
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
 }, 5 * 60 * 1000);
 // 30 minutos * 60 segundos * 1000 milisegundos
});
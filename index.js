// Importar las bibliotecas requeridas
const express = require('express');
// Crea una aplicación en Express
const app = express();
const port = 8225;

// Importar las dependencias necesarias
const { Telegraf } = require('telegraf');
// Importar las bibliotecas requeridas
const jimp = require('jimp-compact');
const request = require('request');

const BOT_TOKEN = '7224464210:AAGNkp79OC1edo_zm7K7Tzzq9298saktTNQ';

// BASE
const BASE_URL = 'https://api.themoviedb.org/3';
// API key TMDB
const API_KEY = 'api_key=74dc824830c7f93dc61b03e324070886';

// Resolución de imagenes
const IMG_ORI = 'https://image.tmdb.org/t/p/original';
const IMG_500 = 'https://image.tmdb.org/t/p/w500';
const IMG_300 = 'https://image.tmdb.org/t/p/w300';
const IMG_185 = 'https://image.tmdb.org/t/p/w185';
const IMG_92 = 'https://image.tmdb.org/t/p/w92';
// Lenguajes
const LANG_ES = 'language=es-MX';
const LANG_EN = 'language=en-US';

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
 const botUser = await bot.telegram.getMe().then(botInfo => `@${botInfo.username}`);

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /start"`);

 if (!userIds.includes(userId)) {
  // Agregar el ID si no está ya en el array
  userIds.push(userId);
 }

 ctx.reply(`¡Hola ${firstName} bienvenid@!\n\nCOMANDOS:\n/start - Para iniciar el bot.\nUsando mi usuario ${botUser}, puedes buscar peliculas en modo inline.\n/movieId - Para uasar: Envvia /movieId + el titulo de una película.\n/imgB - Para uasar: Envvia /imgB + id de una película, y recibiras imagenes Backdrops.\n/imgP - Para uasar: Envvia /imgP + id de una película, y recibiras imagenes posters.\n/marcaB - Para uasar: Responde a una imagen horizontal.\n/marcaP - Para uasar: Responde a una imagen vertical.`);
});

// Responde cuando alguien usa el comando /backdrop
bot.command('marcaB', async (ctx) => {
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
   const watermark1 = await jimp.read('Wtxt-Backdrop.png');
   const watermark2 = await jimp.read('Wlogo-Backdrop.png');

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

// Responde cuando alguien usa el comando /Poster
bot.command('marcaP', async (ctx) => {
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
   image.resize(720, 1080, jimp.RESIZE_MAGPHASE);

   // Cargar las marcas de agua
   const watermark1 = await jimp.read('Wtxt-poster.png');
   const watermark2 = await jimp.read('Wlogo-poster.png');

   // Escala la marca de agua a 1280px de ancho por 720px de alto
   watermark1.resize(720, 1080);
   watermark2.resize(720, 1080);

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

// Comando para buscar backdrops
bot.command('imgB', (ctx) => {
 const idMovie = ctx.message.text.split(' ')[1]; // Obtiene el ID de la película del mensaje
 const url = `${BASE_URL}/movie/${idMovie}/images?${API_KEY}`;

 request(url, (error, response, body) => {
  if (error) {
   console.log('Ay, mi amor, algo salió mal:', error);
   ctx.reply('Ocurrió un error al buscar los backdrops. Intenta de nuevo más tarde.');
   return;
  }

  const backdrops = JSON.parse(body).backdrops;

  if (backdrops.length === 0) {
   ctx.reply('Lo siento, no se encontraron backdrops para esta película.');
   return;
  }

  // Filtrar backdrops por idioma
  const filteredBackdrops = backdrops.filter(backdrop => {
   return backdrop.iso_639_1 === 'es' || backdrop.iso_639_1 === 'en' || backdrop.iso_639_1 === null;
  });

  // Agrupar backdrops por idioma
  const groupedBackdrops = filteredBackdrops.reduce((acc, backdrop) => {
   const lang = backdrop.iso_639_1 || 'null'; // Usa 'null' si no hay idioma
   if (!acc[lang]) acc[lang] = [];
   if (acc[lang].length < 2) acc[lang].push(backdrop);
   return acc;
  }, {});

  // Enviar solo dos backdrops por idioma
  for (const lang in groupedBackdrops) {
   groupedBackdrops[lang].forEach(backdrop => {
    const backdropUrl = IMG_ORI + backdrop.file_path; // Genera la URL de cada backdrop
    ctx.replyWithPhoto(backdropUrl); // Envía la imagen
   });
  }

  if (Object.keys(groupedBackdrops).length === 0) {
   ctx.reply('No se encontraron backdrops en los idiomas deseados.');
  }
 });
});

// Comando para buscar posters
bot.command('imgP', (ctx) => {
 const idMovie = ctx.message.text.split(' ')[1]; // Obtiene el ID de la película del mensaje
 const url = `${BASE_URL}/movie/${idMovie}/images?${API_KEY}`;

 request(url, (error, response, body) => {
  if (error) {
   console.log('Ay, mi amor, algo salió mal:', error);
   ctx.reply('Ocurrió un error al buscar los posters. Intenta de nuevo más tarde.');
   return;
  }

  const posters = JSON.parse(body).posters;

  if (posters.length === 0) {
   ctx.reply('Lo siento, no se encontraron posters para esta película.');
   return;
  }

  // Filtrar posters por idioma
  const filteredPosters = posters.filter(poster=> {
   return backdrop.iso_639_1 === 'es' || backdrop.iso_639_1 === 'en' || backdrop.iso_639_1 === null;
  });

  // Agrupar posters por idioma
  const groupedPosters = filteredPosters.reduce((acc, backdrop) => {
   const lang = backdrop.iso_639_1 || 'null'; // Usa 'null' si no hay idioma
   if (!acc[lang]) acc[lang] = [];
   if (acc[lang].length < 2) acc[lang].push(backdrop);
   return acc;
  }, {});

  // Enviar solo dos posters por idioma
  for (const lang in groupedPosters) {
   groupedPosters[lang].forEach(poster=> {
    const backdropUrl = IMG_ORI + backdrop.file_path; // Genera la URL de cada backdrop
    ctx.replyWithPhoto(backdropUrl); // Envía la imagen
   });
  }

  if (Object.keys(groupedPosters).length === 0) {
   ctx.reply('No se encontraron posters en los idiomas deseados.');
  }
 });
});

// Comando para buscar información de las películas por título
bot.command('movieId', (ctx) => {
 const query = ctx.message.text.split(' ')[1]; // Obtiene el título de la película del mensaje
 const url = `${BASE_URL}/search/movie?${API_KEY}&${LANG_ES}&query=${encodeURIComponent(query)}`;

 request(url, (error, response, body) => {
  if (error) {
   console.log('Ay, mi amor, algo salió mal:', error);
   ctx.reply('Ocurrió un error al buscar las películas. Intenta de nuevo más tarde.');
   return;
  }

  const data = JSON.parse(body);

  if (!data.results || data.results.length === 0) {
   ctx.reply('Lo siento, no se encontraron películas con ese título.');
   return;
  }

  let message = 'Resultados encontrados:\n▬▬▬▬▬▬▬▬▬\n';
  data.results.forEach(movie => {
   const movieId = movie.id;
   const title = movie.title;
   const releaseDate = movie.release_date.split("-")[0];
   
   message += `Título: ${title} (${releaseDate})\nID: ${movieId}\n\n▬▬▬▬▬▬▬▬▬\n\n`;
  });

  ctx.reply(message);
 });
});

// Iniciamos la búsqueda inline
bot.on('inline_query', async (ctx) => {
 const query = ctx.inlineQuery.query;
 const url = `${BASE_URL}/search/movie?${API_KEY}&${LANG_ES}&query=${encodeURIComponent(query)}`;

 request(url, async (error, response, body) => {
  if (error) {
   console.log('Ay, mi amor, algo salió mal:', error);
   ctx.answerInlineQuery([{ type: 'article', id: 'error', title: 'Error', input_message_content: { message_text: 'Lo siento, ocurrió un error. Intenta de nuevo más tarde.' } }]);
   return;
  }

  const results = JSON.parse(body).results;
  const resultsList = await Promise.all(results.map(async movie => {
   const id = movie.id;
   const title = movie.title;
   const initial = movie.title.substring(0, 1); // Cambiado aquí
   const originalTitle = movie.original_title;
   const releaseYear = movie.release_date.split("-")[0];
   const posterPath = movie.poster_path;
   const langCode = movie.original_language;
   const overview = movie.overview;
   const genre = movie.genre_ids;

   const langComplete = getLanguage(langCode);
   const genreEs = getGenres(genre);
   const durationTime = await getDurationMovie(id);
   const actors = await getActorsMovie(id);

   return {
    type: 'article',
    id: id,
    title: `${title} (${releaseYear})`,
    input_message_content: {
     message_text: `⟨🔠⟩ #${initial}\n▬▬▬▬▬▬▬▬▬\n⟨🍿⟩ ${title} (${releaseYear})\n⟨🎥⟩ ${originalTitle}\n▬▬▬▬▬▬▬▬▬\n⟨⭐⟩ Tipo : #Pelicula\n⟨🎟⟩ Estreno: #Año${releaseYear}\n⟨🗣️⟩ Idioma Original: ${langComplete}\n⟨🔊⟩ Audio: 🇲🇽 #Dual_Latino\n⟨📺⟩ Calidad: #HD\n⟨⏳⟩ Duración: ${durationTime}\n⟨🎭⟩ Género: ${genreEs}\n⟨👤⟩ Reparto: ${actors}\n▬▬▬▬▬▬▬▬▬\n⟨💭⟩ Sinopsis: ${overview}\n▬▬▬▬▬▬▬▬▬\n\n\nhttps://fsfeds95.github.io/introMovieClub/moreImage.html?idMovie=${id}`
    },
    thumb_url: IMG_92 + posterPath,
    description: `${originalTitle}\n${overview.substring(0, 100)}...`, // Cambiado aquí()
   };
  }));

  ctx.answerInlineQuery(resultsList);
 });
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

// Ve los documentos/archivos
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

// Para otros tipos de archivos
bot.on('message', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un tipo de archivo no valido"`);

 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido. Por favor, intenta enviar una imagen, video, documento o audio en su lugar. ¡Gracias!');
});

//=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=\\
//                       FUNCIONES                       \\

// Función: Traducir el lenguaje.
function getLanguage(languageCode) {
 const languages = {
  en: "🇺🇸 #Ingles",
  ca: "🇪🇸 #Catalan",
  fr: "🇫🇷 #Frances",
  de: "🇩🇪 #Aleman",
  it: "🇮🇹 #Italiano",
  ja: "🇯🇵 #Japones",
  ru: "🇷🇺 #Ruso",
  zh: "🇨🇳 #Chino",
  pl: "🇵🇱 #Polaco",
  ko: "🇰🇷 / 🇰🇵 #Coreano",
  es: "🇲🇽 / 🇪🇸 #Español",
 };
 return languages[languageCode] || languageCode;
}

// Función: Obtener la duración de la película.
async function getDurationMovie(id) {
 return new Promise((resolve, reject) => {
  request(`${BASE_URL}/movie/${id}?${API_KEY}&${LANG_ES}`, (error, response, body) => {
   if (error) {
    console.log(error);
    reject(error);
   }
   const duracion = JSON.parse(body).runtime;
   const horas = Math.floor(duracion / 60);
   const minutos = duracion % 60;
   resolve(`${horas}h ${minutos}m`);
  });
 });
}

function getGenres(genreIds) {
 const genres = {
  12: "#Aventura",
  14: "#Fantasia",
  16: "#Animacion",
  18: "#Drama",
  27: "#Terror",
  28: "#Accion",
  35: "#Comedia",
  36: "#Historia",
  37: "#Oeste",
  53: "#Suspenso",
  80: "#Crimen",
  99: "#Documental",
  878: "#Ciencia_Ficcion",
  9648: "#Misterio",
  10402: "#Musica",
  10749: "#Romance",
  10751: "#Familiar",
  10752: "#Belica",
  10759: "#Accion_y_Aventura",
  10762: "#Infantil",
  10763: "#Noticias",
  10764: "#Realidad",
  10765: "#Ciencia_Ficcion_y_Fantasia",
  10766: "#Serial",
  10767: "#Conversacion",
  10768: "#Politico",
  10769: "#Opcion_Interactiva"
 };

 const genreList = genreIds.map(genreId => genres[genreId]).filter(Boolean);
 return genreList.join(" ");
}

// Función: Obtener actores.
async function getActorsMovie(id) {
 return new Promise((resolve, reject) => {
  request(`${BASE_URL}/movie/${id}/credits?${API_KEY}&${LANG_ES}`, (error, response, body) => {
   if (error) {
    console.log('Ay, mi amor, algo salió mal:', error);
    reject(error);
   }
   const relevantActors = JSON.parse(body).cast.filter(actor => actor.order <= 4);
   const actorNames = relevantActors.map(actor => `#${actor.name.replace(/\s/g, '_').replace(/'/g, '').replace(/-/g, '')} (${actor.character.replace(' (voice)', '').replace(' (hiccups)', '').replace(' (uncredited)', '')})`);
   resolve(actorNames.join("\n                  "));
  });
 });
}


bot.launch();


//=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=\\

// Ruta "/tamosVivos"
app.get('/tamosVivos', (req, res) => {
 // Enviar una respuesta vacía
 res.send('');
});

// Iniciar el servidor en el puerto 8225
app.listen(port, () => {
 console.log(`Servidor iniciado en http://localhost:${port}`);

 // Código del cliente para mantener la conexión activa
 setInterval(() => {
  fetch(`http://localhost:${port}/tamosVivos`)
   .then(response => {
    const currentDate = new Date().toLocaleString("es-VE", { timeZone: "America/Caracas" });
    const formattedTime = currentDate;
    console.log(`Sigo vivo 🎉 (${formattedTime})`);
   })
   .catch(error => {
    console.error('Error en la solicitud de tamosVivos:', error);
   });
 }, 5 * 60 * 1000);
 // 30 minutos * 60 segundos * 1000 milisegundos
});
// Importar las bibliotecas requeridas
const express = require('express'); // Para crear el servidor web
const { Telegraf } = require('telegraf'); // Para interactuar con la API de Telegram
const request = require('request'); // Para hacer solicitudes HTTP
const xml2js = require('xml2js'); // Para convertir XML a JSON
const Bottleneck = require('bottleneck'); // Para limitar conexiones

// Crear una aplicación en Express
const app = express();
const port = 8225; // Puerto donde se ejecutará el servidor

const BOT_TOKEN = '7224464210:AAFZZaddmgTLHRNq3pupUhDuC-Uxi9dZCz0'; // Token del bot de Telegram
const bot = new Telegraf(BOT_TOKEN); // Inicializa el bot

let lastCtx = null; // Variable para guardar el último contexto

const ALLOWED_USER_ID = 6839704393; // Reemplaza con el ID del usuario permitido


// URLs de los feeds RSS
// Comando para obtener todos los artículos
const RSS_all_1 = 'https://www.cinemascomics.com/feed/';
// Comando para obtener todos los artículos
const RSS_all_2 = 'https://spoiler.bolavip.com/rss/feed';

// Comando para obtener artículos de cine
const RSS_cine = 'https://www.cinemascomics.com/cine/feed/';
// Comando para obtener artículos de series
const RSS_serie = 'https://www.cinemascomics.com/series-de-television/feed/';

// Conjuntos para almacenar los IDs de los artículos enviados
const sentCinemascomicsIds = new Set();
const sentSpoilerIds = new Set();
const sentSerieIds = new Set();

// Configuración del limitador
const limiter = new Bottleneck({
 minTime: 7500, // Espera 7.5 segundo entre cada solicitud
});

// Función para verificar si la URL de la imagen es válida
const isValidImageUrl = (url, callback) => {
 request.head(url, (err, res) => {
  callback(!err && res.statusCode === 200); // Llama al callback con true si la URL es válida
 });
};

// Función para obtener y enviar artículos de cine
const fetchCinemascomics = (ctx = null) => {
 return new Promise((resolve, reject) => {
  request(RSS_all_1, (error, response, body) => {
   if (!error && response.statusCode === 200) {
    xml2js.parseString(body, (err, result) => {
     if (!err) {
      const items = result.rss.channel[0].item; // Obtiene los artículos del feed
      const randomArticles = items.sort(() => 0.6 - Math.random()).slice(0, 6); // Artículos aleatorios

      randomArticles.forEach(item => {
       const id = item.link[0]; // Usamos el enlace como ID único
       if (!sentCinemascomicsIds.has(id)) { // Verificamos si ya fue enviado
        sentCinemascomicsIds.add(id); // Añadimos a los enviados

        // Extraemos información del artículo
        const title = item.title[0];
        const link = item.link[0];
        const description = item.description[0];
        const content = item['content:encoded'][0];
        const imageUrl = extractImage_1(content); // Obtener la imagen
        const hashtags = ['#Cine', '#Noticias', '#Películas', '#Estrenos', '#Cultura', '#Entretenimiento', '#introCinemaClub'];

        // Procesar categorías para crear hashtags
        const categoriesText = item.category ? item.category : [];
        const catReplace = categoriesText.join(' ').replace(/\s/g, '_');
        const hashtagCat = `#` + catReplace.split('_').join(' #');

        const uniqueHashtags = new Set(hashtags);
        hashtagCat.split(' ').forEach(cat => {
         if (cat) {
          uniqueHashtags.delete(cat); // Elimina si ya existe
         }
        });

        const finalHashtags = Array.from(uniqueHashtags).join(' '); // Combina los hashtags únicos

        const message = `
⟨📰⟩ #Noticia
▬▬▬▬▬▬▬▬▬
⟨🍿⟩ ${title}
▬▬▬▬▬▬▬▬▬
⟨💭⟩ Resumen: ${description.substring(0, 500)}...
▬▬▬▬▬▬▬▬▬
${finalHashtags}
▬▬▬▬▬▬▬▬▬
`;

        // Verificar si la URL de la imagen es válida
        isValidImageUrl(imageUrl, (isValid) => {
         if (isValid) {
          // Crear un botón para el enlace
          const button = [{ text: '⟨🗞️⟩ Leer más ⟨🗞️⟩', url: link }];
          bot.telegram.sendPhoto(ctx.chat.id, imageUrl, { caption: message, reply_markup: { inline_keyboard: [button] } })
           .catch(err => console.error('Error al enviar el mensaje:', err)); // Manejo de errores
         } else {
          console.error('URL de imagen no válida:', imageUrl);
         }
        });
       }
      });
      resolve(); // Resuelve la promesa
     } else {
      console.error('Error al parsear el RSS:', err);
      reject(err); // Rechaza la promesa
     }
    });
   } else {
    console.error('Error al obtener el RSS:', error);
    reject(error); // Rechaza la promesa
   }
  });
 });
};

// Función para obtener y enviar artículos
const fetchSpoiler = (ctx = null) => {
 return new Promise((resolve, reject) => {
  request(RSS_all_2, (error, response, body) => {
   if (!error && response.statusCode === 200) {
    xml2js.parseString(body, (err, result) => {
     if (!err) {
      const items = result.rss.channel[0].item; // Obtiene los artículos del feed
      const randomArticles = items.sort(() => 0.6 - Math.random()).slice(0, 6); // Artículos aleatorios

      randomArticles.forEach(item => {
       const id = item.link[0]; // Usamos el enlace como ID único
       if (!sentSpoilerIds.has(id)) { // Verificamos si ya fue enviado
        sentSpoilerIds.add(id); // Añadimos a los enviados

        // Extraemos información del artículo
        const title = item.title[0];
        const link = item.link[0];
        const description = item.description[0].replace(/<[^>]*>/g, '');
        const imageUrl = item['media:content'] ? item['media:content'][0].$.url : null;

        const hashtags = ['#Cine', '#Noticias', '#Películas', '#Estrenos', '#Cultura', '#Entretenimiento', '#introCinemaClub'];

        // Procesar categorías para crear hashtags
        const categoriesText = item.category ? item.category : [];
        const catReplace = categoriesText.join(' ').replace(/\s/g, '_');
        const hashtagCat = `#` + catReplace.split('_').join(' #');

        const uniqueHashtags = new Set(hashtags);
        hashtagCat.split(' ').forEach(cat => {
         if (cat) {
          uniqueHashtags.delete(cat); // Elimina si ya existe
         }
        });

        const finalHashtags = Array.from(uniqueHashtags).join(' '); // Combina los hashtags únicos

        const message = `
⟨📰⟩ #Noticia
▬▬▬▬▬▬▬▬▬
⟨🍿⟩ ${title}
▬▬▬▬▬▬▬▬▬
⟨💭⟩ Resumen: ${description.substring(0, 500)}...
▬▬▬▬▬▬▬▬▬
${finalHashtags}
▬▬▬▬▬▬▬▬▬
`;

        // Verificar si la URL de la imagen es válida
        isValidImageUrl(imageUrl, (isValid) => {
         if (isValid) {
          // Crear un botón para el enlace
          const button = [{ text: '⟨🗞️⟩ Leer más ⟨🗞️⟩', url: link }];
          bot.telegram.sendPhoto(ctx.chat.id, imageUrl, { caption: message, reply_markup: { inline_keyboard: [button] } })
           .catch(err => console.error('Error al enviar el mensaje:', err)); // Manejo de errores
         } else {
          console.error('URL de imagen no válida:', imageUrl);
         }
        });
       }
      });
      resolve(); // Resuelve la promesa
     } else {
      console.error('Error al parsear el RSS:', err);
      reject(err); // Rechaza la promesa
     }
    });
   } else {
    console.error('Error al obtener el RSS:', error);
    reject(error); // Rechaza la promesa
   }
  });
 });
};

// Función para obtener y enviar artículos de cine
const fetchCine = (ctx = null) => {
 return new Promise((resolve, reject) => {
  request(RSS_cine, (error, response, body) => {
   if (!error && response.statusCode === 200) {
    xml2js.parseString(body, (err, result) => {
     if (!err) {
      const items = result.rss.channel[0].item; // Obtiene los artículos del feed
      const randomArticles = items.sort(() => 0.3 - Math.random()).slice(0, 3); // Artículos aleatorios

      randomArticles.forEach(item => {
       const id = item.link[0]; // Usamos el enlace como ID único
       if (!sentCinemascomicsIds.has(id)) { // Verificamos si ya fue enviado
        sentCinemascomicsIds.add(id); // Añadimos a los enviados

        // Extraemos información del artículo
        const title = item.title[0];
        const link = item.link[0];
        const description = item.description[0];
        const content = item['content:encoded'][0];
        const imageUrl = extractImage_1(content); // Obtener la imagen
        const hashtags = ['#Cine', '#Noticias', '#Películas', '#Estrenos', '#Cultura', '#Entretenimiento', '#introCinemaClub'];

        // Procesar categorías para crear hashtags
        const categoriesText = item.category ? item.category : [];
        const catReplace = categoriesText.join(' ').replace(/\s/g, '_');
        const hashtagCat = `#` + catReplace.split('_').join(' #');

        const uniqueHashtags = new Set(hashtags);
        hashtagCat.split(' ').forEach(cat => {
         if (cat) {
          uniqueHashtags.delete(cat); // Elimina si ya existe
         }
        });

        const finalHashtags = Array.from(uniqueHashtags).join(' '); // Combina los hashtags únicos

        const message = `
⟨📰⟩ #Noticia
▬▬▬▬▬▬▬▬▬
⟨🍿⟩ ${title}
▬▬▬▬▬▬▬▬▬
⟨💭⟩ Resumen: ${description.substring(0, 500)}...
▬▬▬▬▬▬▬▬▬
${finalHashtags}
▬▬▬▬▬▬▬▬▬
`;

        // Verificar si la URL de la imagen es válida
        isValidImageUrl(imageUrl, (isValid) => {
         if (isValid) {
          // Crear un botón para el enlace
          const button = [{ text: '⟨🗞️⟩ Leer más ⟨🗞️⟩', url: link }];
          bot.telegram.sendPhoto(ctx.chat.id, imageUrl, { caption: message, reply_markup: { inline_keyboard: [button] } })
           .catch(err => console.error('Error al enviar el mensaje:', err)); // Manejo de errores
         } else {
          console.error('URL de imagen no válida:', imageUrl);
         }
        });
       }
      });
      resolve(); // Resuelve la promesa
     } else {
      console.error('Error al parsear el RSS:', err);
      reject(err); // Rechaza la promesa
     }
    });
   } else {
    console.error('Error al obtener el RSS:', error);
    reject(error); // Rechaza la promesa
   }
  });
 });
};

// Función para obtener y enviar artículos de series
const fetchSerie = (ctx = null) => {
 return new Promise((resolve, reject) => {
  request(RSS_serie, (error, response, body) => {
   if (!error && response.statusCode === 200) {
    xml2js.parseString(body, (err, result) => {
     if (!err) {
      const items = result.rss.channel[0].item; // Obtiene los artículos del feed
      const randomArticles = items.sort(() => 0.3 - Math.random()).slice(0, 3); // Artículos aleatorios

      randomArticles.forEach(item => {
       const id = item.link[0]; // Usamos el enlace como ID único
       if (!sentSerieIds.has(id)) { // Verificamos si ya fue enviado
        sentSerieIds.add(id); // Añadimos a los enviados

        // Extraemos información del artículo
        const title = item.title[0];
        const link = item.link[0];
        const description = item.description[0];
        const content = item['content:encoded'][0];
        const imageUrl = extractImage_1(content); // Obtener la imagen
        const hashtags = ['#Cine', '#Noticias', '#Películas', '#Estrenos', '#Cultura', '#Entretenimiento', '#introCinemaClub', '#Serie'];

        // Procesar categorías para crear hashtags
        const categoriesText = item.category ? item.category : [];
        const catReplace = categoriesText.join(' ').replace(/\s/g, '_');
        const hashtagCat = `#` + catReplace.split('_').join(' #');

        const uniqueHashtags = new Set(hashtags);
        hashtagCat.split(' ').forEach(cat => {
         if (cat) {
          uniqueHashtags.delete(cat); // Elimina si ya existe
         }
        });

        const finalHashtags = Array.from(uniqueHashtags).join(' '); // Combina los hashtags únicos

        const message = `
⟨📰⟩ #Noticia
▬▬▬▬▬▬▬▬▬
⟨🍿⟩ ${title}
▬▬▬▬▬▬▬▬▬
⟨💭⟩ Resumen: ${description.substring(0, 500)}...
▬▬▬▬▬▬▬▬▬
${finalHashtags}
▬▬▬▬▬▬▬▬▬
`;

        // Verificar si la URL de la imagen es válida
        isValidImageUrl(imageUrl, (isValid) => {
         if (isValid) {
          // Crear un botón para el enlace
          const button = [{ text: '⟨🗞️⟩ Leer más ⟨🗞️⟩', url: link }];
          bot.telegram.sendPhoto(ctx.chat.id, imageUrl, { caption: message, reply_markup: { inline_keyboard: [button] } })
           .catch(err => console.error('Error al enviar el mensaje:', err)); // Manejo de errores
         } else {
          console.error('URL de imagen no válida:', imageUrl);
         }
        });
       }
      });
      resolve(); // Resuelve la promesa
     } else {
      console.error('Error al parsear el RSS:', err);
      reject(err); // Rechaza la promesa
     }
    });
   } else {
    console.error('Error al obtener el RSS:', error);
    reject(error); // Rechaza la promesa
   }
  });
 });
};

// Configuración de comandos del bot
bot.start((ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /start"`);

 ctx.reply('¡Hola! Estoy aquí para traerte artículos de cine y series.\n\nPuedes usar el comando /cine para obtener 3 artículos de cine aleatorias.\n\nPuedes usar el comando /serie para obtener 3 artículos de series aleatorias')
});

bot.command('cinemascomics', (ctx) => {
 if (ctx.from.id !== ALLOWED_USER_ID) {
  return ctx.reply('Lo siento, no tienes permiso para usar este comando.'); // Mensaje de error
 }

 lastCtx = ctx; // Guarda el contexto
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /cinemascomics"`);

 limiter.schedule(() => fetchCinemascomics(ctx)).catch(err => console.error('Error en fetchCinemascomics:', err));
});

bot.command('spoiler', (ctx) => {
 if (ctx.from.id !== ALLOWED_USER_ID) {
  return ctx.reply('Lo siento, no tienes permiso para usar este comando.'); // Mensaje de error
 }

 lastCtx = ctx; // Guarda el contexto
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /spoiler"`);
 
 limiter.schedule(() => fetchSpoiler(ctx)).catch(err => console.error('Error en fetchSpoiler:', err));
})

bot.command('cine', (ctx) => {
 if (ctx.from.id !== ALLOWED_USER_ID) {
  return ctx.reply('Lo siento, no tienes permiso para usar este comando.'); // Mensaje de error
 }

 lastCtx = ctx; // Guarda el contexto
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /cine"`);

 limiter.schedule(() => fetchCine(ctx)).catch(err => console.error('Error en fetchCine:', err));
});

bot.command('serie', (ctx) => {
 if (ctx.from.id !== ALLOWED_USER_ID) {
  return ctx.reply('Lo siento, no tienes permiso para usar este comando.'); // Mensaje de error
 }

 lastCtx = ctx; // Guarda el contexto
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /serie"`);

 limiter.schedule(() => fetchSerie(ctx)).catch(err => console.error('Error en fetchSerie:', err));
});

// Manejadores de eventos para diferentes tipos de mensajes
bot.on('voice', (ctx) => {
 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

bot.on('photo', (ctx) => {
 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

bot.on('video', (ctx) => {
 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

bot.on('document', (ctx) => {
 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

bot.on('audio', (ctx) => {
 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

bot.on('sticker', (ctx) => {
 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

bot.on('text', (ctx) => {
 ctx.reply('Tu texto es: ' + ctx.message.text);
});

// Manejadores de eventos para diferentes tipos de mensajes
bot.on('message', (ctx) => {
 if (ctx.from.id !== ALLOWED_USER_ID) {
  return ctx.reply('Lo siento, no tienes permiso para enviar mensajes.'); // Mensaje de error
 }
 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

// Mantiene el bot vivo y envía artículos cada 12 horas
setInterval(() => {
 if (lastCtx) {
  limiter.schedule(() => fetchCinemascomics(lastCtx)).catch(err => console.error('Error en fetchCine desde intervalo:', err));
 }
}, 43200000); // Cada 12 horas

// Mantiene el bot vivo y envía artículos cada 12 horas
setInterval(() => {
 if (lastCtx) {
  limiter.schedule(() => fetchSpoiler(lastCtx)).catch(err => console.error('Error en fetchSerie desde intervalo:', err));
 }
}, 43200000); // Cada 12 horas

bot.launch(); // Inicia el bot

// Ruta "/ping" para verificar que el servidor está funcionando
app.get('/ping', (req, res) => {
 const currentDate = new Date().toLocaleString("es-VE", { timeZone: "America/Caracas" });
 console.log(`Sigo vivo 🎉 (${currentDate})`);
 res.send('');
});

// Iniciar el servidor en el puerto 8225
app.listen(port, () => {
 console.log(`Servidor iniciado en http://localhost:${port}`);

 // Mantiene la conexión activa
 setInterval(() => {
  fetch(`http://localhost:${port}/ping`)
   .then(response => {
    const currentDate = new Date().toLocaleString("es-VE", { timeZone: "America/Caracas" });
    console.log(`Sigo vivo 🎉 (${currentDate})`);
   })
   .catch(error => {
    console.error('Error en la solicitud de ping:', error);
   });
 }, 5 * 60 * 1000); // Cada 5 minutos
});

// Función para extraer la URL de la primera imagen del contenido
const extractImage_1 = (content) => {
 const match = content.match(/<img[^>]+src="([^">]+)"/);
 return match ? match[1] : null; // Retorna la URL de la primera imagen o null
};
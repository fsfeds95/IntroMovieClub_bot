// Importar las bibliotecas requeridas
const express = require('express');
// Crea una aplicación en Express
const app = express();
const port = 8225;

// Importar las dependencias necesarias
const { Telegraf } = require('telegraf');
const request = require('request');
const xml2js = require('xml2js');

const BOT_TOKEN = '7224464210:AAGhhGrLV0NqgJKOl0Dcbl7TIUXCXTt0fOU';

const bot = new Telegraf(BOT_TOKEN);

const RSS_cine = 'https://www.cinemascomics.com/cine/feed/';
const RSS_serie = 'https://www.cinemascomics.com/series-de-television/feed/';

const extractImage = (content) => {
 const match = content.match(/<img[^>]+src="([^">]+)"/);
 return match ? match[1] : null; // Retorna la URL de la primera imagen
};

const isValidImageUrl = (url, callback) => {
 request.head(url, (err, res) => {
  if (!err && res.statusCode === 200) {
   callback(true);
  } else {
   callback(false);
  }
 });
};

const fetchCine = (ctx = null) => {
 request(RSS_cine, (error, response, body) => {
  if (!error && response.statusCode === 200) {
   xml2js.parseString(body, (err, result) => {
    if (!err) {
     const items = result.rss.channel[0].item;
     const randomArticles = items.sort(() => 0.5 - Math.random()).slice(0, 3); // Artículos aleatorios

     if (ctx) {
      randomArticles.forEach(item => {
       const title = item.title[0];
       const link = item.link[0];
       const description = item.description[0];
       const content = item['content:encoded'][0];
       const imageUrl = extractImage(content); // Obtener la imagen
       const hashtags = ['#Cine', '#Noticias', '#Películas', '#Estrenos', '#Cultura', '#Entretenimiento', '#introCinemaClub'];

       // Obtener categorías como texto plano
       const categoriesText = item.category ? item.category : [];
       const catReplace = categoriesText.join(' ').replace(/\s/g, '_'); // Reemplaza espacios por guiones bajos
       const hashtagCat = `#` + catReplace.split('_').join(' #'); // Agrega el símbolo de hashtag

       // Crear un conjunto de hashtags únicos
       const uniqueHashtags = new Set(hashtags);

       // Comparar y eliminar los que ya están en hashtags
       hashtagCat.split(' ').forEach(cat => {
        if (cat) {
         uniqueHashtags.delete(cat); // Elimina si ya existe
        }
       });

       // Unir los hashtags únicos de nuevo en una cadena
       const finalHashtags = Array.from(uniqueHashtags).join(' ');

       const message = `
⟨📰⟩ #Noticia
▬▬▬▬▬▬▬▬▬
⟨🍿⟩ ${title}
▬▬▬▬▬▬▬▬▬
⟨💭⟩ Resumen: ${description.substring(0, 1500)}...
▬▬▬▬▬▬▬▬▬
${finalHashtags}
▬▬▬▬▬▬▬▬▬
`;

       // Verificar si la URL de la imagen es válida
       isValidImageUrl(imageUrl, (isValid) => {
        if (isValid) {
         // Crear un botón para el enlace
         const button = [{ text: '⟨🗞️⟩ Leer más ⟨🗞️⟩', url: link }];
         ctx.replyWithPhoto(imageUrl, { caption: message, reply_markup: { inline_keyboard: [button] } })
          .catch(err => console.error('Error al enviar el mensaje:', err));
        } else {
         console.error('URL de imagen no válida:', imageUrl);
        }
       });
      });
     }
    } else {
     console.error('Error al parsear el RSS:', err);
    }
   });
  } else {
   console.error('Error al obtener el RSS:', error);
  }
 });
};

const fetchSerie = (ctx = null) => {
 request(RSS_serie, (error, response, body) => {
  if (!error && response.statusCode === 200) {
   xml2js.parseString(body, (err, result) => {
    if (!err) {
     const items = result.rss.channel[0].item;
     const randomArticles = items.sort(() => 0.5 - Math.random()).slice(0, 3); // Artículos aleatorios

     if (ctx) {
      randomArticles.forEach(item => {
       const title = item.title[0];
       const link = item.link[0];
       const description = item.description[0];
       const content = item['content:encoded'][0];
       const imageUrl = extractImage(content); // Obtener la imagen
       const hashtags = ['#Cine', '#Noticias', '#Películas', '#Estrenos', '#Cultura', '#Entretenimiento', '#introCinemaClub'];

       // Obtener categorías como texto plano
       const categoriesText = item.category ? item.category : [];
       const catReplace = categoriesText.join(' ').replace(/\s/g, '_'); // Reemplaza espacios por guiones bajos
       const hashtagCat = `#` + catReplace.split('_').join(' #'); // Agrega el símbolo de hashtag

       // Crear un conjunto de hashtags únicos
       const uniqueHashtags = new Set(hashtags);

       // Comparar y eliminar los que ya están en hashtags
       hashtagCat.split(' ').forEach(cat => {
        if (cat) {
         uniqueHashtags.delete(cat); // Elimina si ya existe
        }
       });

       // Unir los hashtags únicos de nuevo en una cadena
       const finalHashtags = Array.from(uniqueHashtags).join(' ');

       const message = `
⟨📰⟩ #Noticia
▬▬▬▬▬▬▬▬▬
⟨🍿⟩ ${title}
▬▬▬▬▬▬▬▬▬
⟨💭⟩ Resumen: ${description.substring(0, 1500)}...
▬▬▬▬▬▬▬▬▬
${finalHashtags}
▬▬▬▬▬▬▬▬▬
`;

       // Verificar si la URL de la imagen es válida
       isValidImageUrl(imageUrl, (isValid) => {
        if (isValid) {
         // Crear un botón para el enlace
         const button = [{ text: '⟨🗞️⟩ Leer más ⟨🗞️⟩', url: link }];
         ctx.replyWithPhoto(imageUrl, { caption: message, reply_markup: { inline_keyboard: [button] } })
          .catch(err => console.error('Error al enviar el mensaje:', err));
        } else {
         console.error('URL de imagen no válida:', imageUrl);
        }
       });
      });
     }
    } else {
     console.error('Error al parsear el RSS:', err);
    }
   });
  } else {
   console.error('Error al obtener el RSS:', error);
  }
 });
};

//=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=\\
//                        COMANDOS                       \\

// Respuesta de Bienvenida al comando /start
bot.start((ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;


 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /start"`);

 ctx.reply('¡Hola! Estoy aquí para traerte artículos de cine y series.\n\nPuedes usar el comando /cine para obtener 3 artículos de cine aleatorias.\n\nPuedes usar el comando /serie para obtener 3 artículos de series aleatorias')
});

// Enviar artículos aleatorios
bot.command('cine', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /cine"`);

 fetchCine(ctx)
});

// Enviar artículos aleatorios
bot.command('serie', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /serie"`);

 fetchSerie(ctx)
});

//=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=•=\\
//                        EVENTOS                        \\

// Ve los voice
bot.on('voice', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un voice"`);

 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

// Ve los fotos
bot.on('photo', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio una foto"`);

 // Envía la url al chat
 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

// Ve los videos
bot.on('video', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un video"`);

 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

// Ve los documentos/archivos
bot.on('document', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un documento"`);

 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

// Ve los audios
bot.on('audio', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un audio"`);

 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

// Responde cuando alguien responde a la imagen
bot.on('reply_to_message', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} respondio a una imagen"`);

 if (ctx.message.reply_to_message.photo) {
  ctx.reply('');
 }
});

// Ve los stickers
bot.on('sticker', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un stickers"`);

 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

// Repite todoo lo que le escribas
bot.on('text', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un texto"`);

 ctx.reply('Tu texto es: ' + ctx.message.text);
});

// Para otros tipos de archivos
bot.on('message', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} envio un tipo de archivo no valido"`);

 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});


// Mantiene el bot vivo y envía solo el último artículo
setInterval(() => fetchCine(), 60000);

// Mantiene el bot vivo y envía solo el último artículo
setInterval(() => fetchSerie(), 60000);

bot.launch();

// Ruta "/ping"
app.get('/ping', (req, res) => {
 res.send('');
});

// Iniciar el servidor en el puerto 8225
app.listen(port, () => {
 console.log(`Servidor iniciado en http://localhost:${port}`);

 // Código del cliente para mantener la conexión activa
 setInterval(() => {
  fetch(`http://localhost:${port}/ping`)
   .then(response => {
    const currentDate = new Date().toLocaleString("es-VE", { timeZone: "America/Caracas" });
    console.log(`Sigo vivo 🎉 (${currentDate})`);
   })
   .catch(error => {
    console.error('Error en la solicitud de ping:', error);
   });
 }, 5 * 60 * 1000); // 5 m * 60 s * 1000 ms
});
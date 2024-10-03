// Importar las bibliotecas requeridas
const express = require('express'); // Para crear el servidor web
const { Telegraf } = require('telegraf'); // Para interactuar con la API de Telegram
const request = require('request'); // Para hacer solicitudes HTTP
const xml2js = require('xml2js'); // Para convertir XML a JSON

// Crear una aplicación en Express
const app = express();
const port = 8225; // Puerto donde se ejecutará el servidor

const BOT_TOKEN = '7224464210:AAGhhGrLV0NqgJKOl0Dcbl7TIUXCXTt0fOU'; // Token del bot de Telegram
const bot = new Telegraf(BOT_TOKEN); // Inicializa el bot

// URLs de los feeds RSS
const RSS_cine = 'https://www.cinemascomics.com/cine/feed/';
const RSS_serie = 'https://www.cinemascomics.com/series-de-television/feed/';

// Conjuntos para almacenar los IDs de los artículos enviados
const sentCineIds = new Set(); 
const sentSerieIds = new Set(); 

// Función para extraer la URL de la primera imagen del contenido
const extractImage = (content) => {
 const match = content.match(/<img[^>]+src="([^">]+)"/);
 return match ? match[1] : null; // Retorna la URL de la primera imagen o null
};

// Función para verificar si la URL de la imagen es válida
const isValidImageUrl = (url, callback) => {
 request.head(url, (err, res) => {
  callback(!err && res.statusCode === 200); // Llama al callback con true si la URL es válida
 });
};

// Función para obtener y enviar artículos de cine
const fetchCine = (ctx = null) => {
 request(RSS_cine, (error, response, body) => {
  if (!error && response.statusCode === 200) {
   xml2js.parseString(body, (err, result) => {
    if (!err) {
     const items = result.rss.channel[0].item; // Obtiene los artículos del feed

     items.forEach(item => {
      const id = item.link[0]; // Usamos el enlace como ID único
      if (!sentCineIds.has(id)) { // Verificamos si ya fue enviado
       sentCineIds.add(id); // Añadimos a los enviados
       
       // Extraemos información del artículo
       const title = item.title[0];
       const link = item.link[0];
       const description = item.description[0];
       const content = item['content:encoded'][0];
       const imageUrl = extractImage(content); // Obtener la imagen
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
         bot.telegram.sendPhoto(ctx.chat.id, imageUrl, { caption: message, reply_markup: { inline_keyboard: [button] } })
          .catch(err => console.error('Error al enviar el mensaje:', err)); // Manejo de errores
        } else {
         console.error('URL de imagen no válida:', imageUrl);
        }
       });
      }
     });
    } else {
     console.error('Error al parsear el RSS:', err);
    }
   });
  } else {
   console.error('Error al obtener el RSS:', error);
  }
 });
};

// Función para obtener y enviar artículos de series
const fetchSerie = (ctx = null) => {
 request(RSS_serie, (error, response, body) => {
  if (!error && response.statusCode === 200) {
   xml2js.parseString(body, (err, result) => {
    if (!err) {
     const items = result.rss.channel[0].item; // Obtiene los artículos del feed

     items.forEach(item => {
      const id = item.link[0]; // Usamos el enlace como ID único
      if (!sentSerieIds.has(id)) { // Verificamos si ya fue enviado
       sentSerieIds.add(id); // Añadimos a los enviados
       
       // Extraemos información del artículo
       const title = item.title[0];
       const link = item.link[0];
       const description = item.description[0];
       const content = item['content:encoded'][0];
       const imageUrl = extractImage(content); // Obtener la imagen
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
         bot.telegram.sendPhoto(ctx.chat.id, imageUrl, { caption: message, reply_markup: { inline_keyboard: [button] } })
          .catch(err => console.error('Error al enviar el mensaje:', err)); // Manejo de errores
        } else {
         console.error('URL de imagen no válida:', imageUrl);
        }
       });
      }
     });
    } else {
     console.error('Error al parsear el RSS:', err);
    }
   });
  } else {
   console.error('Error al obtener el RSS:', error);
  }
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

// Comando para obtener artículos de cine
bot.command('cine', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /cine"`);

 fetchCine(ctx); // Llama a la función para obtener artículos de cine
});

// Comando para obtener artículos de series
bot.command('serie', (ctx) => {
 const username = ctx.from.username ? `@${ctx.from.username}` : '';
 const firstName = ctx.from.first_name ? ctx.from.first_name : '';
 const userId = ctx.from.id;

 console.log(`"Nombre: ${firstName}, Usuario: ${username}, con el id: ${userId} uso : /serie"`);

 fetchSerie(ctx); // Llama a la función para obtener artículos de series
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

bot.on('reply_to_message', (ctx) => {
 if (ctx.message.reply_to_message.photo) {
  ctx.reply('');
 });

});

bot.on('sticker', (ctx) => {
 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

bot.on('text', (ctx) => {
 ctx.reply('Tu texto es: ' + ctx.message.text);
});

bot.on('message', (ctx) => {
 ctx.reply('¡Ups! Parece que has enviado un formato de archivo no válido.');
});

// Mantiene el bot vivo y envía artículos cada minuto
setInterval(() => fetchCine(), 60000); // Cada 60 segundos
setInterval(() => fetchSerie(), 60000); // Cada 60 segundos

bot.launch(); // Inicia el bot

// Ruta "/ping" para verificar que el servidor está funcionando
app.get('/ping', (req, res) => {
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

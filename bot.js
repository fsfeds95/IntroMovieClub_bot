const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('7299943772:AAFMZ8yI9RVwpG9GNXQBpZsMJTRW0S05kCM');
const apiKey = '74dc824830c7f93dc61b03e324070886';

bot.command('pelicula', async (ctx) => {
 const query = ctx.message.text.split(' ').slice(1).join(' ');

 try {
  const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`);

  const movies = response.data.results;

  const results = movies.map(movie => {
   return `${movie.title} (${movie.release_date.split('-')[0]})\n${movie.original_title}\nIdioma: ${movie.original_language}\nGéneros: ${movie.genre_ids.join(', ')}\n${movie.overview}\n\n`;
  });

  ctx.reply('Resultados de la búsqueda:\n\n' + results.join('\n\n'));
 } catch (error) {
  console.log(error);
  ctx.reply('Lo siento, hubo un error al buscar la película.');
 }
});

bot.launch();
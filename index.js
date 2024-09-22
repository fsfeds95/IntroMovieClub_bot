const { Telegraf } = require('telegraf');
const axios = require('axios');

const API_KEY = '74dc824830c7f93dc61b03e324070886';
const BOT_TOKEN = '7799058013:AAE-HjGVOt5AbOKfdR-KGL66reWhdADPgn8';

const bot = new Telegraf(BOT_TOKEN);

bot.on('inline_query', async (ctx) => {
 const query = ctx.inlineQuery.query;
 if (!query) return;

 const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=${query}`);
 const movies = response.data.results;

 const results = movies.map(movie => ({
  type: 'article',
  id: movie.id,
  title: movie.title,
  input_message_content: {
   message_text: `
        ![Backdrop](${movie.backdrop_path ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : ''})
        **${movie.title} (${movie.release_date.split('-')[0]})**
        - Título original: ${movie.original_title}
        - Idioma original: ${movie.original_language}
        - Duración: ${movie.runtime} min
        - Géneros: ${movie.genre_ids.join(', ')}
        - Sinopsis: ${movie.overview}
      `,
  },
  thumb_url: movie.backdrop_path ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : '',
  description: movie.title,
 }));

 await ctx.answerInlineQuery(results);
});

bot.launch();
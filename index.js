const { Telegraf } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = '7799058013:AAE-HjGVOt5AbOKfdR-KGL66reWhdADPgn8';
const TMDB_API_KEY = '74dc824830c7f93dc61b03e324070886';

const bot = new Telegraf(BOT_TOKEN);

bot.on('inline_query', async (ctx) => {
 const query = ctx.inlineQuery.query;
 const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`);

 const results = response.data.results.map((movie) => ({
  type: 'photo',
  id: movie.id.toString(),
  photo_url: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
  thumb_url: `https://image.tmdb.org/t/p/w200${movie.backdrop_path}`,
  caption: movie.title,
  parse_mode: 'HTML'
 }));

 ctx.answerInlineQuery(results);
});

bot.on('chosen_inline_result', async (ctx) => {
 const movieId = ctx.chosenInlineResult.result_id;
 const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`);

 const movie = response.data;
 const genres = movie.genres.map(genre => genre.name).join(', ');

 const message = `
🎬 <b>${movie.title} (${movie.release_date.slice(0, 4)})</b>
🌟 <b>${movie.original_title}</b>
🗣️ Idioma original: <b>${movie.original_language}</b>
⏱️ Duración: <b>${movie.runtime} min</b>
🎭 Géneros: <b>${genres}</b>
📝 Sinopsis: ${movie.overview}
🔗 Más información: https://www.themoviedb.org/movie/${movie.id}
    `;

 ctx.replyWithPhoto(`https://image.tmdb.org/t/p/original${movie.backdrop_path}`, { caption: message, parse_mode: 'HTML' });
});

bot.launch();
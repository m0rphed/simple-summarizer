import { Bot } from 'grammy';
import { getTextSummary } from './summarization.js';
import { getReadable } from './parsing.js';
import isURI from 'validate.io-uri';

const bot = new Bot(process.env.TG_BOT_TOKEN);

bot.command('link', async (ctx) => {
  const message = ctx.message.text;
  const articleURL = message.split(' ')[1];

  if (!isURI(articleURL)) {
    ctx.reply('Invalid URL. Please provide a valid URL.');
    return;
  }

  try {
    // fetch and extract the article text from specified URL
    const articleBody = await getReadable(articleURL)

    // trim article body
    const trimmed = articleBody.substring(0, 200).trimStart();
    console.log('Article body: ', trimmed, '...');

    // get the summary (using HuggingFace models)
    const summary = await getTextSummary(trimmed);

    // send the summary as a response
    ctx.reply(summary);
  } catch (error) {
    console.error('Error:', error.message);
    ctx.reply('An error occurred while processing the article. Please try again later.');
  }
});

// handle the /start command.
bot.command('start',
  (ctx) => ctx.reply('Welcome to the article summarization bot! Use /link <URL> to get the summary of an article.')
);

// start the bot.
bot.start();
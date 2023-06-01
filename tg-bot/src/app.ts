import { Bot, Context } from 'grammy';
import fetch from 'node-fetch';
import isURI from '@stdlib/assert-is-uri';
import { getReadableTextFromArchives as checkAndGetText } from './parsing';

// check that telegram token env variable is set 
if (!process.env.TG_BOT_TOKEN) {
  throw new Error('Error: environment variable "TG_BOT_TOKEN" was not set');
}

// get telegram bot token, then start bot
const bot = new Bot(process.env.TG_BOT_TOKEN);

// handle '/link' bot command
bot.command('link', async (ctx: Context) => {
  const message = ctx.message?.text;
  if (!message) return;

  const articleURL = message.split(' ')[1];

  if (!isURI(articleURL)) {
    ctx.reply('Invalid URL. Please provide a valid URL.');
    return;
  }

  try {
    // fetch and extract the article text from the specified URL
    const articleText = await checkAndGetText(articleURL);

    // trim the article body
    const trimmed = articleText.substring(0, 200).trimStart();
    console.log('Article: ', trimmed, '...');

    // get the summary by calling the summarization provider API
    const summary = await getTextSummary(trimmed);

    // send the summary as a response
    ctx.reply(summary);
  } catch (error: any) {
    console.error('Error:', error.message);
    ctx.reply('An error occurred while processing the article. Please try again later.');
  }
});

// handle the /start command.
bot.command('start', (ctx: Context) => {
  ctx.reply('Welcome to the article summarization bot! Use /link <URL> to get the summary of an article.');
});

// start the bot.
bot.start();

// function to get the summary by calling the summarization provider API
async function getTextSummary(text: string): Promise<string> {
  // Parse API server IP from environment variable
  process.env.MODEL_SERVER_IP

  const apiURL = `${process.env.MODEL_SERVER_ADDR}/summarize`;

  console.log(apiURL);

  const response = await fetch(apiURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
      max_length: 1024,   // Modify as needed
      min_length: 512,    // Modify as needed
      do_sample: false,   // Modify as needed
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get the summary from service ${response.json()}`);
  }

  const data = await response.json();
  return data.summary;
}

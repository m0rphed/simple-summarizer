import { Bot, Context } from 'grammy';
import fetch from 'node-fetch';
import isURI from '@stdlib/assert-is-uri';
import { getReadableText } from './parsing';

if (!process.env.TG_BOT_TOKEN) {
  throw new Error('Error: environment variable "TG_BOT_TOKEN" was not set');
}

const bot = new Bot(process.env.TG_BOT_TOKEN);

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
    const articleBody = await getReadableText(articleURL);

    // trim the article body
    const trimmed = articleBody.substring(0, 200).trimStart();
    console.log('Article body:', trimmed, '...');

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

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import axios from 'axios';

export const getReadable = async (articleURL) => {
    // fetch the web page content
    const response = await axios.get(articleURL);
    const html = response.data;

    // extract the article text using Readability
    const dom = new JSDOM(html, { url: articleURL });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    const articleBody = article.textContent;
    return articleBody;
}
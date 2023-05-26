import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import axios from 'axios';

const getReadableObj = async (articleURL) => {
    // fetch the web page content
    const response = await axios.get(articleURL);
    const html = response.data;

    // extract the article text using Readability
    const dom = new JSDOM(html, { url: articleURL });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    const title = article.title.trimStart().trimEnd();
    const textBody = article.textContent.trimStart().trimEnd();

    const res = {
        'language': article.lang,
        'byline_or_author': article.byline,
        'title': title,
        'text_body': textBody,
        'length': title.length + textBody.length,
    };

    return res;
}

export const getReadableText = async (articleURL) => {
    // fetch the web page content
    const response = await axios.get(articleURL);
    const html = response.data;

    // extract the article text using Readability
    const dom = new JSDOM(html, { url: articleURL });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    return 'Article title: ' + article.title.trimStart().trimEnd() +
        '\n\n' +
        'Article text:' + article.textContent.trimStart().trimEnd();
}
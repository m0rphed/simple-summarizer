import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import fetch from 'node-fetch';

async function checkArchive(url) {
    const googleCacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${url}`;
    const waybackMachineUrl = `https://web.archive.org/save/${url}`;

    // Check Google Cache
    const googleCacheResponse = await fetch(googleCacheUrl);
    if (googleCacheResponse.status === 200) {
        const content = await googleCacheResponse.text();
        console.log('Google Cache Content:', content);
        return googleCacheUrl;
    }

    // Check Wayback Machine
    const waybackMachineResponse = await fetch(waybackMachineUrl);
    if (waybackMachineResponse.status === 200) {
        const content = await waybackMachineResponse.text();
        console.log('Wayback Machine Content:', content);
        return waybackMachineUrl;
    }

    return null; // URL not available in Google Cache or Wayback Machine
}

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
    const response = await axios.get(articleURL)
    const html = response.data;

    // extract the article text using Readability
    const dom = new JSDOM(html, { url: articleURL });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    return 'Article title: ' + article.title.trimStart().trimEnd() +
        '\n\n' +
        'Article text:' + article.textContent.trimStart().trimEnd();
}

const url = 'https://www.nytimes.com/2023/05/26/us/politics/russia-public-opinion-ukraine-war.html';
const lol = await checkArchive(url);
if (lol !== null) {
    const kek = await getReadableObj(lol);
    console.log(kek);
}

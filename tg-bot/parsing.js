import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import fetch from 'node-fetch';


const getPageHTML = async (pageURL) => {
    // fetch the web page content
    const response = await axios.get(pageURL);
    return response.data;
}

const checkArchive = async (url) => {
    const googleCacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${url}`;
    const waybackMachineUrl = `https://web.archive.org/save/${url}`;

    // Check Google Cache
    const googleCacheResponse = await fetch(googleCacheUrl);
    if (googleCacheResponse.status === 200) {
        console.log('Google Cache: ✅');
        // const content = await googleCacheResponse.text();
        // console.log('Google Cache Content:', content);
        return googleCacheUrl;
    }

    console.log('Google Cache: ❌');

    // Check Wayback Machine
    const waybackMachineResponse = await fetch(waybackMachineUrl);
    if (waybackMachineResponse.status === 200) {
        console.log('Wayback Machine: ✅');
        // const content = await waybackMachineResponse.text();
        // console.log('Wayback Machine Content:', content);
        return waybackMachineUrl;
    }

    console.log('Wayback Machine: ❌');

    return null; // URL not available in Google Cache or Wayback Machine
}

const getReadableObj = async (pageHTML, pageURL) => {
    // extract the article text using Readability
    const dom = new JSDOM(pageHTML, { url: pageURL });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    const title = article.title.trimStart().trimEnd();
    const textBody = article.textContent.trimStart().trimEnd();

    const resObj = {
        'language': article.lang,
        'byline_or_author': article.byline,
        'title': title,
        'text_body': textBody,
        'length': title.length + textBody.length,
    };

    return resObj;
}

export const textFromObj = (articleObj) => {
    return 'Title: ' +
        articleObj.title +
        '\n\n' + articleObj.text_body;
}

export const getReadableText = async (articleURL) => {
    try {
        const html = await getPageHTML(articleURL);
        const obj = await getReadableObj(html, articleURL);
        return textFromObj(obj);
    } catch (error) {
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
            console.log('❌ Problems with URL, checking in archives...');
            // Fetching failed with 404 or 403 response, check archive
            const archiveURL = await checkArchive(articleURL);

            if (archiveURL) {
                console.log(`URL not available. You can view the archived version here: ${archiveURL}`);
                const html = await getPageHTML(archiveURL);
                const obj = await getReadableObj(html, archiveURL);
                return textFromObj(obj);
            }
        }
        throw error;
    }
}

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import fetch from 'node-fetch';
import isURI from '@stdlib/assert-is-uri';


const getHTML = async (pageURL: string): Promise<string> => {
    if (!isURI(pageURL)) {
        throw new Error(`Error: invalid URL: ${pageURL}`);
    }

    const response = await axios.get(pageURL);
    return response.data;
};

const checkArchive = async (pageURL: string): Promise<string | null> => {
    const googleCacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${pageURL}`;
    const waybackMachineUrl = `https://web.archive.org/save/${pageURL}`;

    // Check Google Cache
    const googleCacheResponse = await fetch(googleCacheUrl);
    if (googleCacheResponse.status === 200) {
        console.log('Google Cache: ✅');
        return googleCacheUrl;
    }

    console.log('Google Cache: ❌');

    // Check Wayback Machine
    const waybackMachineResponse = await fetch(waybackMachineUrl);
    if (waybackMachineResponse.status === 200) {
        console.log('Wayback Machine: ✅');
        return waybackMachineUrl;
    }

    console.log('Wayback Machine: ❌');
    return null; // URL not available in Google Cache or Wayback Machine
};

const getReadableObj = async (pageHTML: string, pageURL: string): Promise<any> => {
    // extract the article text using mozilla's readability lib
    const dom = new JSDOM(pageHTML, { url: pageURL });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    const title = article?.title.trimStart().trimEnd();
    const textBody = article?.textContent.trimStart().trimEnd();

    const resObj = {
        language: article?.lang,
        byline_or_author: article?.byline,
        title: title,
        text_body: textBody,
        length: article?.length
    };

    return resObj;
};

export const textFromObj = (articleObj: any): string => {
    return `${articleObj.title}\n\n${articleObj.text_body}`;
};

export const getReadableText = async (articleURL: string): Promise<string> => {
    try {
        const html = await getHTML(articleURL);
        const obj = await getReadableObj(html, articleURL);
        return textFromObj(obj);
    } catch (error: any) {
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
            console.log('❌ Problems with URL, checking in archives...');
            // Fetching failed with 404 or 403 response, check archive
            const archiveURL = await checkArchive(articleURL);

            if (archiveURL) {
                console.log(`URL not available. You can view the archived version here: ${archiveURL}`);
                const html = await getHTML(archiveURL);
                const obj = await getReadableObj(html, archiveURL);
                return textFromObj(obj);
            }
        }
        throw error;
    }
};

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import fetch from 'node-fetch';
import isURI from '@stdlib/assert-is-uri';


const getHTML = async function (pageURL: string): Promise<string> {
    if (!isURI(pageURL)) {
        throw new Error(`Error: invalid URL: ${pageURL}`);
    }

    const response = await axios.get(pageURL);
    return response.data;
};

const checkWaybackMachine = async function (pageURL: string): Promise<string | null> {
    const waybackURL = `https://web.archive.org/save/${pageURL}`;
    const resp = await fetch(waybackURL);

    if (resp.status === 200) {
        return waybackURL;
    }

    return null;
};

const checkGoogleCache = async function (pageURL: string): Promise<string | null> {
    const googleCacheURL = `https://webcache.googleusercontent.com/search?q=cache:${pageURL}`;
    const resp = await fetch(googleCacheURL);

    if (resp.status === 200) {
        return googleCacheURL;
    }

    return null;
};

const checkArchives = async function (pageURL: string) {
    // Check Google Cache
    const respGoogleCache = await checkGoogleCache(pageURL);
    if (respGoogleCache) {
        console.log('Google Cache: ✅');
        return respGoogleCache;
    }

    console.log('Google Cache: ❌');

    // Check Wayback Machine
    const respWaybackMachine = await checkWaybackMachine(pageURL);
    if (respWaybackMachine) {
        console.log('Wayback Machine: ✅');
        return respWaybackMachine;
    }

    console.log('Wayback Machine: ❌');

    // URL not available in Google Cache or Wayback Machine
    return null;
};

export const getReadableObj = async function (pageHTML: string, pageURL: string) {
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

export const getReadableText = async function (pageURL: string) {
    const html = await getHTML(pageURL);
    const obj = await getReadableObj(html, pageURL);
    return textFromObj(obj);
};

export const getReadableObjFromArchives = async function (pageURL: string) {
    try {
        const html = await getHTML(pageURL);
        return await getReadableObj(html, pageURL);
    } catch (error: any) {
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
            console.log('❌ Problems with URL, checking in archives...');
            const archivedURL = await checkArchives(pageURL);
            if (!archivedURL) {
                throw new Error(
                    `Error: problem fetching page ${pageURL}; Neither any archived copies were found`
                );
            }

            const html = await getHTML(archivedURL);
            return await getReadableObj(html, archivedURL);
        }

        throw error;
    }
};

export const textFromObj = function (articleObj: any): string {
    return `${articleObj.title}\n\n${articleObj.text_body}`;
};


export const getReadableTextFromArchives = async function (pageURL: string) {
    const obj = await getReadableObjFromArchives(pageURL);
    return textFromObj(obj);
};
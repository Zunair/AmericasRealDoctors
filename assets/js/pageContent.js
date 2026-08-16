import { SITE_CONTENT } from './data/siteContent.js';

export const PAGE_LINKS = SITE_CONTENT.pages.map((page) => [page.title, page.url]);

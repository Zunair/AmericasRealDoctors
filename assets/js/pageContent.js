import { contentService } from './services/contentService.js';

const siteContent = await contentService.getSiteContent();

export const PAGE_LINKS = siteContent.pages.map((page) => [page.title, page.url]);

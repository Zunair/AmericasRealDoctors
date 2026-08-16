const PRIMARY_NAV_LINKS = [
  { href: '/pages/explore-map.html', label: 'Explore Map' },
  { href: '/pages/doctor-search-results.html', label: 'Find a Doctor' },
  { href: '/pages/join-as-doctor.html', label: 'Join as a Doctor' },
  { href: '/pages/how-verification-works.html', label: 'Verification' },
  { href: '/pages/admin-dashboard.html', label: 'Admin' }
];

const FOOTER_LINKS = [
  { href: '/pages/about.html', label: 'About' },
  { href: '/pages/frequently-asked-questions.html', label: 'FAQ' },
  { href: '/pages/privacy-policy.html', label: 'Privacy Policy' },
  { href: '/pages/terms-of-use.html', label: 'Terms of Use' },
  { href: '/pages/medical-disclaimer.html', label: 'Medical Disclaimer' },
  { href: '/pages/accessibility-statement.html', label: 'Accessibility Statement' },
  { href: '/pages/contact.html', label: 'Contact' },
  { href: '/sitemap.xml', label: 'XML Sitemap' }
];

export class SharedChromeController {
  constructor({ documentRoot = document } = {}) {
    this.documentRoot = documentRoot;
  }

  initialize() {
    if (!this.documentRoot.querySelector('main')) return;

    if (!this.documentRoot.querySelector('.site-header')) {
      this.documentRoot.body.prepend(this.createHeader());
    }

    if (!this.documentRoot.querySelector('.site-footer')) {
      this.documentRoot.body.append(this.createFooter());
    }
  }

  buildLinkList(links) {
    return links.map((link) => `<a href="${link.href}">${link.label}</a>`).join('');
  }

  createHeader() {
    const header = this.documentRoot.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a class="brand" href="/index.html">America's Real Doctors</a>
      <nav class="nav-links" aria-label="Primary">${this.buildLinkList(PRIMARY_NAV_LINKS)}</nav>
      <div class="header-actions">
        <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle dark and light theme" aria-pressed="false"></button>
        <a class="btn header-sign-in" href="/pages/sign-in.html">Sign In</a>
      </div>
    `;
    return header;
  }

  createFooter() {
    const footer = this.documentRoot.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
      <nav class="footer-links" aria-label="Footer">${this.buildLinkList(FOOTER_LINKS)}</nav>
      <small>Educational directory only. No personalized medical advice. No doctor ranking based on payment.</small>
    `;
    return footer;
  }
}

export function initializeSharedChrome() {
  new SharedChromeController().initialize();
}
/* About the webinar + About CFMR — one shared content source for every page. */
(async () => {
  'use strict';
  const slot = document.getElementById('shared-about');
  if (!slot) return;
  const { load, filename, externalUrl, node } = window.CFMR_DATA || {};
  if (!load) {
    slot.replaceChildren(nodeFallback('Unable to load the shared sections: session-data.js is missing.'));
    return;
  }
  const siteRoot = new URL(slot.dataset.siteRoot || './', document.baseURI);
  const resource = relativePath => new URL(relativePath, siteRoot).href;
  const paragraphs = (target, value, className) => {
    for (const piece of (value || '').split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)) {
      target.append(node('p', className, piece.replace(/\n/g, ' ')));
    }
  };
  function nodeFallback(message) {
    const el = document.createElement('p');
    el.className = 'session-load-error';
    el.textContent = message;
    return el;
  }
  function organizer(person) {
    const block = node('article', 'webinar-organizer');
    const portrait = filename(person.picture_name);
    if (portrait) {
      const img = node('img', 'webinar-organizer-photo');
      img.src = resource('assets/images/organizers/' + portrait);
      img.alt = `Portrait of ${person.name || 'organizer'}`;
      img.loading = 'lazy';
      block.append(img);
    } else {
      const placeholder = node('div', 'webinar-organizer-photo webinar-photo-placeholder', 'Photo to add');
      placeholder.setAttribute('aria-label', 'Organizer portrait not yet provided');
      block.append(placeholder);
    }
    const body = node('div', 'webinar-organizer-detail');
    body.append(node('h3', '', person.name || 'Organizer name'));
    if (person.institution) body.append(node('p', 'webinar-organizer-institution', person.institution));
    paragraphs(body, person.short_bio, 'webinar-organizer-bio');
    block.append(body);
    return block;
  }
  function actionButton(label, destination, className, missingHint) {
    const href = externalUrl(destination || '');
    if (href) {
      const button = node('a', 'about-action ' + className, label);
      button.href = href;
      button.target = '_blank';
      button.rel = 'noopener noreferrer';
      return button;
    }
    // A missing destination is visible but intentionally not clickable.
    const disabled = node('span', 'about-action ' + className + ' about-action-disabled', label);
    disabled.setAttribute('aria-disabled', 'true');
    disabled.title = missingHint;
    return disabled;
  }
  function aboutWebinar(data) {
    const section = node('section', 'content-section about-webinar-section');
    section.id = 'about-webinar';
    section.setAttribute('aria-labelledby', 'about-webinar-title');

    // Match the two-column structure of the adjacent About CFMR section:
    // logo and heading on the left, copy / organizers / actions on the right.
    const heading = node('div', 'about-webinar-heading');
    const logo = node('img', 'webinar-about-logo');
    logo.src = resource('assets/images/webinar-logo.png');
    logo.alt = 'CFMR Webinar Series logo';
    logo.width = 148;
    heading.append(logo);
    const title = node('h2');
    title.id = 'about-webinar-title';
    title.append(document.createTextNode('About the'), node('span', 'about-webinar-title-break', 'webinar'));
    heading.append(title);

    const copy = node('div', 'about-webinar-copy');
    const info = data.webinar || {};
    paragraphs(copy, info.description, 'about-webinar-description');
    const people = Object.keys(data).filter(key => /^organizer\d+$/.test(key))
      .sort((a,b) => Number(a.slice(9)) - Number(b.slice(9)));
    if (people.length === 2 && Math.random() < 0.5) {
        people.reverse();
    }
    if (people.length) {
      const organizers = node('div', 'webinar-organizers');
      organizers.setAttribute('aria-label', 'Webinar organizers');
      for (const key of people) organizers.append(organizer(data[key]));
      copy.append(organizers);
    }
    const actions = node('div', 'about-actions');
    actions.append(
      actionButton('Subscribe to the newsletter', info.newsletter_url, 'about-action-primary', 'Set newsletter_url in content/about.txt'),
      actionButton('Watch the previous sessions on YouTube', info.youtube_url, 'about-action-secondary', 'Set youtube_url in content/about.txt')
    );
    copy.append(actions);
    section.append(heading, copy);
    return section;
  }
  function aboutCfmr(data) {
    const section = node('section', 'content-section about-section');
    section.id = 'about';
    section.setAttribute('aria-labelledby', 'about-title');
    const heading = node('div', 'about-heading');
    const logo = node('img', 'cfmr-about-logo');
    logo.src = resource('assets/images/cfmr-logo.svg');
    logo.alt = 'CFMR logo'; logo.width = 148;
    const title = node('h2', '', 'About CFMR');
    title.id = 'about-title';
    heading.append(logo, title);
    const info = data.cfmr || {};
    const copy = node('div', 'about-copy');
    paragraphs(copy, info.description);    const actions = node('div', 'about-actions');
    actions.append(
      actionButton('Visit the CFMR website', info.website_url, 'about-action-primary', 'Set website_url in content/about.txt'),
      actionButton('Become a CFMR member', info.membership_url, 'about-action-secondary', 'Set membership_url in content/about.txt')
    );
    copy.append(actions);
    section.append(heading, copy);
    return section;
  }
  try {
    const data = await load(resource('content/about.txt'), { requireSession: false });
    if (!data.webinar || !data.cfmr) throw new Error('content/about.txt needs [webinar] and [cfmr] sections.');
    slot.replaceChildren(aboutWebinar(data), aboutCfmr(data));
  } catch (error) {
    console.error('CFMR shared sections:', error);
    slot.replaceChildren(nodeFallback('Unable to load About the webinar and About CFMR. Check content/about.txt and refresh the page.'));
  }
})();

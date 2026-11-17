/* Shared session template — only sessions/<slug>/session.txt needs editing. */
(async () => {
  'use strict';
  const { load, filename, node } = window.CFMR_DATA;
  const el = id => document.getElementById(id);

  function paragraphs(parent, value, className) {
    for (const paragraph of (value || '').split(/\n\s*\n/).filter(Boolean)) {
      parent.append(node('p', className, paragraph.trim()));
    }
  }

  function speakerBlock(speaker) {
    const article = node('article', 'speaker');
    const picture = filename(speaker.picture_name);
    if (picture) {
      const img = node('img', 'speaker-photo');
      img.src = picture; // Resolved relative to this session folder.
      img.alt = `Portrait of ${speaker.name || 'the speaker'}`;
      img.loading = 'lazy';
      article.append(img);
    }
    const details = node('div', 'speaker-details');
    details.append(node('h3', 'speaker-name', speaker.name || 'Speaker to be announced'));
    if (speaker.institution) details.append(node('p', 'speaker-institution', speaker.institution));
    if (speaker.title) details.append(node('h4', 'speaker-talk', speaker.title));
    if (speaker.abstract) {
      details.append(node('p','speaker-label','Abstract'));
      paragraphs(details, speaker.abstract, 'speaker-abstract');
    }
    if (speaker.short_bio) {
      details.append(node('p','speaker-label','Short biography'));
      paragraphs(details, speaker.short_bio, 'speaker-bio');
    }
    article.append(details);
    return article;
  }

  try {
    const data = await load('session.txt');
    const session = data.session;
    document.title = `${session.title} | CFMR Webinar Series`;
    el('session-title').textContent = session.title;
    el('session-summary').textContent = session.summary || '';
    const meta = el('session-meta');
    if (session.date) {
      const date = node('span');
      date.append(node('strong','', 'Date: '), document.createTextNode(session.date));
      meta.append(date);
    }
    {
      const time = node('span');
      time.append(node('strong','', 'Time: '), document.createTextNode(session.time || 'To be announced'));
      meta.append(time);
    }

    // The former “Session overview” hero button is now the .ics download.
    // No broken link is shown for sessions whose calendar file is not yet ready.
    const ics = filename(session.ics_file);
    if (ics && /\.ics$/i.test(ics)) {
      const link = node('a', 'session-ics-link', 'Download calendar file (.ics) ↓');
      link.href = ics;
      link.download = ics;
      el('session-hero-actions').append(link);
    } else {
      const pending = node('span', 'session-ics-link session-ics-unavailable', 'Calendar download available when scheduled');
      pending.setAttribute('aria-disabled', 'true');
      el('session-hero-actions').append(pending);
    }

    const overview = data.overview || {};
    // One full-width paragraph: bold question followed immediately by the description.
    const question = (overview.question || '').replace(/\s+/g, ' ').trim();
    const description = (overview.description || '').replace(/\s+/g, ' ').trim();
    if (question || description) {
      const paragraph = node('p', 'overview-paragraph');
      if (question) paragraph.append(node('strong', 'overview-question-inline', question));
      if (question && description) paragraph.append(document.createTextNode(' '));
      if (description) paragraph.append(document.createTextNode(description));
      el('overview-text').append(paragraph);
      el('session-overview').hidden = false;
    }

    const keys = Object.keys(data).filter(key=>/^speaker\d+$/.test(key))
      .sort((a,b)=>Number(a.slice(7))-Number(b.slice(7)));
    if (keys.length) {
      el('speaker-list').append(...keys.map(key => speakerBlock(data[key])));
      el('session-speakers').hidden = false;
    }
    el('session-load-status').remove();
  } catch (error) {
    console.error('CFMR session:',error);
    el('session-title').textContent = 'Session unavailable';
    el('session-load-status').textContent = 'Unable to load session.txt. Check the file and open the site through a web server (or GitHub Pages).';
    el('session-load-status').classList.add('session-load-error');
  }
})();

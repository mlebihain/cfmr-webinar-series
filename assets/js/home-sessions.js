/* Homepage listings are built from sessions/programme.txt and each session's session.txt.
 * A missing session must not hide all of the other sessions. */
(async () => {
  'use strict';
  const upcoming = document.getElementById('upcoming-list');
  const previous = document.getElementById('previous-list');
  if (!upcoming || !previous) return;

  const lib = window.CFMR_DATA;
  if (!lib) {
    const message = 'Session loader did not start. Check that assets/js/session-data.js was uploaded.';
    for (const target of [upcoming, previous]) {
      const p = document.createElement('p'); p.className = 'session-load-error';
      p.textContent = message; target.replaceChildren(p);
    }
    console.error('CFMR homepage:', message);
    return;
  }
  const { load, filename, node } = lib;

  function readableError(error, path) {
    if (window.location.protocol === 'file:') {
      return 'Session listings require a web server. Do not double-click index.html: run "python3 -m http.server 8000" in the website folder and open http://localhost:8000/, or view the published GitHub Pages site.';
    }
    const reason = error && error.message ? error.message : String(error);
    const suffix = /HTTP 404/.test(reason)
      ? ' Check that the file is committed to GitHub and the spelling/capitalization matches exactly.'
      : ' Check the browser console and verify the repository files are published.';
    return `Could not load ${path}: ${reason}.${suffix}`;
  }

  function parseProgramme(text) {
    const groups = { upcoming: [], previous: [] };
    let heading = '';
    for (const raw of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      if (/^\[(upcoming|previous)\]$/.test(line)) {
        heading = line.slice(1,-1);
        continue;
      }
      if (!heading || !/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(line)) {
        throw new Error('Invalid programme entry: ' + line);
      }
      if (groups[heading].includes(line)) throw new Error('Duplicate programme entry: ' + line);
      groups[heading].push(line);
    }
    return groups;
  }

  function speakerSummary(person, slug) {
    const wrap = node('div', 'speaker-person');
    const photo = filename(person.picture_name);
    if (photo) {
      const img = node('img');
      img.src = `sessions/${slug}/${photo}`;
      img.alt = `Portrait of ${person.name || 'speaker'}`;
      img.width = 74; img.height = 86; img.loading = 'lazy';
      wrap.append(img);
    }
    const details = node('div');
    details.append(node('strong', '', person.name || 'Speaker to be announced'));
    if (person.institution) details.append(node('span', '', person.institution));
    wrap.append(details);
    return wrap;
  }

  function sessionEntry(data, slug, label) {
    const entry = node('article', 'session-row');
    const url = `sessions/${slug}/`;
    const date = node('div', 'session-date');
    date.append(node('span', 'date-kicker', label));
    date.append(node('strong', '', data.session.date || 'Date to be announced'));
    if (data.session.time) date.append(node('span', 'date-sub', data.session.time));
    const content = node('div','session-description');
    const h3 = node('h3');
    const title = node('a','',data.session.title);
    title.href = url;
    h3.append(title); content.append(h3);
    if (data.session.summary) content.append(node('p','session-row-summary',data.session.summary));
    const speakers = Object.keys(data).filter(k=>/^speaker\d+$/.test(k))
      .sort((a,b)=>Number(a.slice(7))-Number(b.slice(7)));
    if (speakers.length) {
      const pair = node('div','speaker-pair'); pair.setAttribute('aria-label','Speakers');
      speakers.forEach(key=>pair.append(speakerSummary(data[key], slug)));
      content.append(pair);
    }
    const go = node('div','session-link-cell');
    const link = node('a','row-link','View session →'); link.href = url;
    go.append(link);
    entry.append(date,content,go);
    return entry;
  }

  async function fetchProgramme() {
    const path = 'sessions/programme.txt';
    let response;
    try { response = await fetch(path, { cache: 'no-cache' }); }
    catch (error) { throw new Error(`${path}: ${error.message || error}`); }
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return parseProgramme(await response.text());
  }

  async function trySession(slug) {
    const path = `sessions/${slug}/session.txt`;
    try { return { slug, data: await load(path) }; }
    catch (error) {
      console.error('CFMR session data:', path, error);
      return { slug, error, path };
    }
  }

  try {
    const programme = await fetchProgramme();
    const next = await Promise.all(programme.upcoming.map(trySession));
    const successful = next.filter(item => item.data);
    const rendered = successful.map((item, index) => sessionEntry(item.data, item.slug, index === 0 ? 'Next webinar' : 'Following webinar'));
    for (const failed of next.filter(item => item.error)) {
      rendered.push(node('p', 'session-load-error', readableError(failed.error, failed.path)));
    }
    upcoming.replaceChildren(...(rendered.length
      ? rendered
      : [node('p','session-loading','New sessions will be announced here.')]));

    const last = programme.previous.length ? await trySession(programme.previous[0]) : null;
    previous.replaceChildren(last
      ? last.data
        ? sessionEntry(last.data, last.slug, 'Previous webinar')
        : node('p','session-load-error',readableError(last.error,last.path))
      : node('p','session-loading','Future webinars will be shared here with the online recording of the session.'));
  } catch (error) {
    console.error('CFMR homepage programme:', error);
    const message = readableError(error, 'sessions/programme.txt');
    upcoming.replaceChildren(node('p','session-load-error',message));
    previous.replaceChildren(node('p','session-load-error',message));
  }
})();

/* CFMR shared plain-text data loader. Works on static GitHub Pages: no build step. */
window.CFMR_DATA = (() => {
  'use strict';
  function parse(text, options = {}) {
    const result = {};
    let section = null;
    let lastKey = null;
    for (const line of text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n')) {
      const trimmed = line.trim();
      if (/^\s*#/.test(line)) continue;
      const header = /^\[([A-Za-z][A-Za-z0-9_]*)\]$/.exec(trimmed);
      if (header) {
        section = header[1].toLowerCase();
        if (result[section]) throw new Error('Duplicate section: ' + section);
        result[section] = {};
        lastKey = null;
        continue;
      }
      const entry = /^([a-z][a-z0-9_]*):(?:\s?(.*))?$/.exec(line);
      if (entry) {
        if (!section) throw new Error('Field outside a [section]: ' + entry[1]);
        const field = entry[1];
        if (Object.prototype.hasOwnProperty.call(result[section], field)) throw new Error('Duplicate field: ' + field);
        result[section][field] = entry[2] || '';
        lastKey = field;
        continue;
      }
      if (/^\s{2,}\S/.test(line)) {
        if (!section || !lastKey) throw new Error('Unexpected indented text: ' + line);
        const value = line.replace(/^ {2}/, '');
        result[section][lastKey] += (result[section][lastKey] ? '\n' : '') + value;
        continue;
      }
      if (trimmed === '') {
        if (section && lastKey && result[section][lastKey]) result[section][lastKey] += '\n';
        continue;
      }
      throw new Error('Invalid session.txt line: ' + line);
    }
    for (const section of Object.values(result)) {
      for (const [key, value] of Object.entries(section)) section[key] = value.trim();
    }
    if (options.requireSession !== false && (!result.session || !result.session.title)) throw new Error('Missing [session] title');
    return result;
  }
  async function load(url, options = {}) {
    if (window.location.protocol === 'file:') {
      throw new Error('Local file access is blocked by browsers. Use a local web server (see README.md) or GitHub Pages.');
    }
    let response;
    try { response = await fetch(url, { cache: 'no-cache' }); }
    catch (error) { throw new Error('Network error while loading ' + url + ': ' + (error.message || error)); }
    if (!response.ok) throw new Error('HTTP ' + response.status + ' for ' + url);
    return parse(await response.text(), options);
  }
  function filename(value) {
    // A portrait or calendar path can only be a filename within its own session folder.
    return /^[a-zA-Z0-9_-][a-zA-Z0-9._-]*$/.test(value || '') && !value.includes('..') ? value : '';
  }
  function externalUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch { return ''; }
  }
  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  return { parse, load, filename, externalUrl, node };
})();

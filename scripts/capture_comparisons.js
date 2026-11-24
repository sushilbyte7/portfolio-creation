const fs = require('fs');
const path = require('path');

// Ensure screenshots dir exists
const ssDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(ssDir)) fs.mkdirSync(ssDir, { recursive: true });

async function getCDPVersion() {
  const res = await fetch('http://127.0.0.1:9222/json/version');
  return await res.json();
}

async function createTarget(url) {
  const res = await fetch(`http://127.0.0.1:9222/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  return await res.json();
}

async function closeTarget(targetId) {
  await fetch(`http://127.0.0.1:9222/json/close/${targetId}`);
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function captureSite(siteName, url, viewport = { width: 1440, height: 900 }) {
  console.log(`\n=== Capturing ${siteName} (${url}) at ${viewport.width}x${viewport.height} ===`);
  const target = await createTarget(url);
  const client = new CDPClient(target.webSocketDebuggerUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width < 600,
  });

  // Wait for page to settle
  await new Promise((r) => setTimeout(r, 2500));

  // 1. Hero screenshot
  const heroShot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ssDir, `${siteName}_hero_${viewport.width}.png`), Buffer.from(heroShot.data, 'base64'));
  console.log(`Saved ${siteName}_hero_${viewport.width}.png`);

  // 1b. Scroll into Bio / Portrait Journey
  await client.send('Runtime.evaluate', {
    expression: `document.querySelector('#bio')?.scrollIntoView({ behavior: 'instant', block: 'center' }) || window.scrollTo({ top: 900, behavior: 'instant' })`,
  });
  await new Promise((r) => setTimeout(r, 1200));
  const bioShot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ssDir, `${siteName}_bio_${viewport.width}.png`), Buffer.from(bioShot.data, 'base64'));
  console.log(`Saved ${siteName}_bio_${viewport.width}.png`);

  // 2. Scroll to Skills
  await client.send('Runtime.evaluate', {
    expression: `document.querySelector('#skills')?.scrollIntoView({ behavior: 'instant', block: 'start' })`,
  });
  await new Promise((r) => setTimeout(r, 1000));
  const skillsShot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ssDir, `${siteName}_skills_${viewport.width}.png`), Buffer.from(skillsShot.data, 'base64'));
  console.log(`Saved ${siteName}_skills_${viewport.width}.png`);

  // 3. Scroll to Projects
  await client.send('Runtime.evaluate', {
    expression: `document.querySelector('#projects')?.scrollIntoView({ behavior: 'instant', block: 'start' })`,
  });
  await new Promise((r) => setTimeout(r, 1000));
  const projectsShot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ssDir, `${siteName}_projects_${viewport.width}.png`), Buffer.from(projectsShot.data, 'base64'));
  console.log(`Saved ${siteName}_projects_${viewport.width}.png`);

  // 3b. Click first folder to open drawer
  await client.send('Runtime.evaluate', {
    expression: `document.querySelector('.folder-tab-btn')?.click()`,
  });
  await new Promise((r) => setTimeout(r, 800));
  const projectDrawerShot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ssDir, `${siteName}_project_drawer_${viewport.width}.png`), Buffer.from(projectDrawerShot.data, 'base64'));
  console.log(`Saved ${siteName}_project_drawer_${viewport.width}.png`);

  // 4. Scroll to Experience
  await client.send('Runtime.evaluate', {
    expression: `document.querySelector('#experience')?.scrollIntoView({ behavior: 'instant', block: 'start' })`,
  });
  await new Promise((r) => setTimeout(r, 1000));
  const expShot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ssDir, `${siteName}_experience_${viewport.width}.png`), Buffer.from(expShot.data, 'base64'));
  console.log(`Saved ${siteName}_experience_${viewport.width}.png`);

  // 5. Scroll to Contact
  await client.send('Runtime.evaluate', {
    expression: `document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant', block: 'start' })`,
  });
  await new Promise((r) => setTimeout(r, 1000));
  const contactShot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ssDir, `${siteName}_contact_${viewport.width}.png`), Buffer.from(contactShot.data, 'base64'));
  console.log(`Saved ${siteName}_contact_${viewport.width}.png`);

  // 6. Scroll to Footer (Crowd scene)
  await client.send('Runtime.evaluate', {
    expression: `document.querySelector('.site-footer')?.scrollIntoView({ behavior: 'instant', block: 'start' })`,
  });
  await new Promise((r) => setTimeout(r, 1500));
  const footerShot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ssDir, `${siteName}_footer_${viewport.width}.png`), Buffer.from(footerShot.data, 'base64'));
  console.log(`Saved ${siteName}_footer_${viewport.width}.png`);

  client.close();
  await closeTarget(target.id);
}

async function main() {
  try {
    // Capture Local Desktop
    await captureSite('local', 'http://localhost:3000/', { width: 1440, height: 900 });

    // Capture Local Mobile
    await captureSite('local', 'http://localhost:3000/', { width: 390, height: 844 });

    console.log('\nLocal comparison screenshots updated successfully in /screenshots!');
  } catch (err) {
    console.error('Error in capture:', err);
  }
}

main();

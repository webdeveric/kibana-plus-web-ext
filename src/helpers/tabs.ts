import browser, { type Tabs } from 'webextension-polyfill';

export async function getActiveTab(): Promise<Tabs.Tab> {
  const [ tab ] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tab;
}

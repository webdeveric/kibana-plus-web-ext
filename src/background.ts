import {
  browserAction,
  contextMenus,
  permissions,
  runtime,
  tabs,
  type Menus,
  type Permissions,
  type Tabs,
} from 'webextension-polyfill';

import { Emoji, kibanaPlus, TabStatus } from './constants';
import { setIconForActiveTab, setIconForTab, setIconForTabs } from './helpers/browserAction';
import { getAllPermissions, hasPermission, requestPermissions } from './helpers/permissions';
import { removePermissions } from './helpers/removePermissions';

const grantedTabs = new Set<number>();

// This is loaded from the assets-manifest.json file in the extension directory.
const contentScriptAssets: Record<'css' | 'js', string[]> = {
  css: [],
  js: [],
};

async function contentScriptHasLoaded(tabId: number): Promise<boolean> {
  const [hasLoaded] = await tabs.executeScript(tabId, {
    code: '!! window?.KibanaPlus?.loaded;',
  });

  console.log(`Tab ${tabId} has existing content script: ${hasLoaded}`);

  return hasLoaded;
}

async function useContentScript(tabId: number): Promise<void> {
  console.log(`Loading ${kibanaPlus} content script in tab ${tabId}`);

  const hasLoaded = await contentScriptHasLoaded(tabId);

  if (!hasLoaded) {
    const results = await Promise.allSettled([
      ...contentScriptAssets.css.map(file => tabs.insertCSS(tabId, { file })),
      ...contentScriptAssets.js.map(file => tabs.executeScript(tabId, { file })),
    ]);

    console.groupCollapsed('browser tabs asset loading');
    console.table(results);
    console.groupEnd();
  }
}

async function maybeUseContentScript(tab: Tabs.Tab): Promise<void> {
  if (tab.id && grantedTabs.has(tab.id)) {
    await useContentScript(tab.id);
  }
}

async function trackGrantedTabs(tab: Tabs.Tab): Promise<Set<number>> {
  if (tab.id && tab.url) {
    const granted = await hasPermission(tab.url);

    console.log(`${tab.url} granted: ${granted}`);

    if (granted) {
      grantedTabs.add(tab.id);
    } else {
      grantedTabs.delete(tab.id);
    }
  }

  return grantedTabs;
}

async function onTabUpdated(tabId: number, changeInfo: Tabs.OnUpdatedChangeInfoType, tab: Tabs.Tab): Promise<void> {
  if ('status' in changeInfo && changeInfo.status === TabStatus.Complete && tab.url) {
    console.log(`Loaded ${tab.url} into tab ${tabId}`);

    await trackGrantedTabs(tab);

    await setIconForTab(tab);

    await maybeUseContentScript(tab);
  }
}

function onTabRemoved(tabId: number): void {
  grantedTabs.delete(tabId);
}

/**
 * This is called when a tab is focused.
 *
 * @param activeInfo
 */
async function onTabActivated(activeInfo: Tabs.OnActivatedActiveInfoType): Promise<void> {
  const tab = await tabs.get(activeInfo.tabId);

  await setIconForTab(tab);
}

/**
 * Add or remove permissions.
 * Don't do anything async before asking for permissions. It will fail if you do.
 *
 * @param tab
 */
async function onBrowserActionClicked(tab: Tabs.Tab /* , eventData?: BrowserAction.OnClickData */): Promise<void> {
  if (tab.id && tab.url) {
    if (grantedTabs.has(tab.id)) {
      await removePermissions(tab.url);
    } else {
      await requestPermissions(tab.url);
    }
  }
}

async function rememberTabsByUrl(url: string[]): Promise<Tabs.Tab[]> {
  const urlTabs = await tabs.query({ url });

  urlTabs.forEach(tab => tab.id && grantedTabs.add(tab.id));

  return urlTabs;
}

async function forgetTabsByUrl(url: string[]): Promise<Tabs.Tab[]> {
  const urlTabs = await tabs.query({ url });

  urlTabs.forEach(tab => tab.id && grantedTabs.delete(tab.id));

  return urlTabs;
}

async function onPermissionsAdded(permissions: Permissions.Permissions): Promise<void> {
  if (!permissions.origins) {
    throw new Error('permissions.origins not set');
  }

  const tabs = await rememberTabsByUrl(permissions.origins);

  tabs.forEach(tab => {
    maybeUseContentScript(tab).catch(console.error);
  });
}

async function onPermissionsRemoved(permissions: Permissions.Permissions): Promise<void> {
  if (!permissions.origins) {
    throw new Error('permissions.origins not set');
  }

  await forgetTabsByUrl(permissions.origins);
}

/**
 * Update the browserAction icon for each Tab that has a permission change.
 */
async function onPermissionsChanged(permissions: Permissions.Permissions): Promise<void> {
  if (!permissions.origins) {
    throw new Error('permissions.origins not set');
  }

  const urlTabs = await tabs.query({
    url: permissions.origins,
  });

  await setIconForTabs(urlTabs);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchJson(path: string): Promise<any> {
  const response = await fetch(runtime.getURL(path), {
    method: 'GET',
    mode: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await response.json();

  return data;
}

async function init(): Promise<void> {
  const assetsManifest = await fetchJson('assets-manifest.json');

  const { css, js } = assetsManifest.entrypoints?.contentScript.assets ?? {};

  if (css?.length) {
    contentScriptAssets.css = css;
  }

  if (js?.length) {
    contentScriptAssets.js = js;
  }

  const permissions = await getAllPermissions();

  console.group('Current permissions');
  console.dir(permissions);
  console.groupEnd();

  const tabs = await rememberTabsByUrl(permissions.origins as string[]);

  await setIconForTabs(tabs);

  console.info(`${kibanaPlus} background script initialized ${Emoji.ThumbsUp}`);
}

async function onStartup(): Promise<void> {
  await setIconForActiveTab();
}

async function onInstalled(/* details: Runtime.OnInstalledDetailsType */): Promise<void> {
  await setIconForActiveTab();
}

contextMenus.create({
  id: 'copy-json',
  title: 'Copy JSON',
  contexts: ['page'],
});

contextMenus.onClicked.addListener((info: Menus.OnClickData, tab?: Tabs.Tab): void => {
  console.log(info);

  if (tab && info.menuItemId == 'copy-json') {
    tabs
      .executeScript(tab.id, {
        frameId: info.frameId,
        code: `window?.KibanaPlus?.copyElementText( menus.getTargetElement(${info.targetElementId}) );`,
      })
      .then(([copied]) => {
        console.groupCollapsed(`Menu item clicked: ${info.menuItemId}`);
        console.log(copied);
        console.groupEnd();
      }, console.error);
  }
});

browserAction.onClicked.addListener(tab => {
  onBrowserActionClicked(tab).catch(console.error);
});

// Filtering doesn't work in Chrome: { properties: [ 'status' ] }
tabs.onUpdated.addListener((...args) => {
  onTabUpdated(...args).catch(console.error);
});

tabs.onRemoved.addListener(onTabRemoved);

tabs.onActivated.addListener((...args) => {
  onTabActivated(...args).catch(console.error);
});

permissions.onAdded.addListener((...args) => {
  onPermissionsAdded(...args).catch(console.error);
});

permissions.onAdded.addListener((...args) => {
  onPermissionsChanged(...args).catch(console.error);
});

permissions.onRemoved.addListener((...args) => {
  onPermissionsRemoved(...args).catch(console.error);
});

permissions.onRemoved.addListener((...args) => {
  onPermissionsChanged(...args).catch(console.error);
});

runtime.onStartup.addListener((...args) => {
  onStartup(...args).catch(console.error);
});

runtime.onInstalled.addListener(() => {
  onInstalled().catch(console.error);
});

runtime
  .setUninstallURL('https://webdeveric.github.io/kibana-plus-web-ext/uninstalled.html')
  .catch(error => console.error(error));

init().catch(error => console.error(error));

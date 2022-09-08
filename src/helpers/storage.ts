import browser from 'webextension-polyfill';

import { isStringArray } from './type-predicate.js';

export type ConfigRecord = Record<string, any>;

export const defaultConfig: ConfigRecord = {
  urls: [],
};

export function withDefaults(
  keys?: keyof typeof defaultConfig | null | string | string[] | ConfigRecord,
): typeof keys {
  if (keys === undefined || keys === null) {
    return defaultConfig;
  }

  if (typeof keys === 'string') {
    return keys in defaultConfig ? { [ keys ]: defaultConfig[ keys ] } : keys;
  }

  if (isStringArray(keys)) {
    return keys.reduce<ConfigRecord>(
      (data: ConfigRecord, key: string) => (
        (data[ key ] = defaultConfig[ key ]), data
      ),
      {},
    );
  }

  return keys;
}

export async function getStorage(
  keys?: null | string | string[] | ConfigRecord,
): Promise<ConfigRecord> {
  const value = await browser.storage.local.get(withDefaults(keys));

  return value;
}

export async function setStorage(keys: ConfigRecord): Promise<void> {
  await browser.storage.local.set(keys);
}

const enum ManageUrlOperation {
  Add,
  Delete,
}

async function manageUrls(
  urls: string[],
  operation: ManageUrlOperation,
): Promise<void> {
  const data = await getStorage('urls');

  const uniqueUrls = new Set(data.urls);

  if (operation === ManageUrlOperation.Add) {
    urls.forEach(url => uniqueUrls.add(url));
  } else {
    urls.forEach(url => uniqueUrls.delete(url));
  }

  await setStorage({ urls: [ ...uniqueUrls ] });
}

export async function rememberUrls(urls: string[]): Promise<void> {
  await manageUrls(urls, ManageUrlOperation.Add);
}

export async function forgetUrls(urls: string[]): Promise<void> {
  await manageUrls(urls, ManageUrlOperation.Delete);
}

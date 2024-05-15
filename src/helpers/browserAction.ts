import { browserAction, type Tabs } from 'webextension-polyfill';

import { kibanaPlus } from '../constants';
import activeIcon from '../icons/active.svg';
import errorIcon from '../icons/error.svg';
import inactiveIcon from '../icons/inactive.svg';
import prohibitedIcon from '../icons/prohibited.svg';

import { hasPermission } from './permissions';
import { getActiveTab } from './tabs';

export async function setTitle(tabId: number, title: string): Promise<void> {
  return browserAction.setTitle({ tabId, title });
}

export function setIcon(tabId: number, path: string): Promise<void> {
  return browserAction.setIcon({
    path,
    tabId,
  });
}

export function setActiveIcon(tabId: number): Promise<void> {
  return setIcon(tabId, activeIcon);
}

export function setInactiveIcon(tabId: number): Promise<void> {
  return setIcon(tabId, inactiveIcon);
}

export function setProhibitedIcon(tabId: number): Promise<void> {
  return setIcon(tabId, prohibitedIcon);
}

export function setErrorIcon(tabId: number): Promise<void> {
  return setIcon(tabId, errorIcon);
}

export async function setIconForTab(tab: Tabs.Tab): Promise<void> {
  if (!tab.id || !tab.url || !/^https?:/.test(tab.url)) {
    return setProhibitedIcon(tab.id as number);
  }

  try {
    const granted = await hasPermission(tab.url);

    await Promise.allSettled([
      setTitle(tab.id, `${granted ? 'Disable' : 'Enable'} ${kibanaPlus}`),
      granted ? setActiveIcon(tab.id) : setInactiveIcon(tab.id),
    ]);
  } catch (error) {
    await Promise.allSettled([setTitle(tab.id, `${error}`), setErrorIcon(tab.id)]);
  }
}

export async function setIconForTabs(tabs: Tabs.Tab[]): Promise<void> {
  await Promise.all(tabs.map(tab => setIconForTab(tab)));
}

export async function setIconForActiveTab(): Promise<void> {
  const tab = await getActiveTab();

  await setIconForTab(tab);
}

export type SetBadgeOptions = {
  tabId: number;
  text?: string;
  color?: string;
  background?: string;
};

export async function setBadge({ tabId, text, color, background }: SetBadgeOptions): Promise<void> {
  if (tabId === undefined) {
    throw new Error('tabId is required');
  }

  if (text) {
    await browserAction.setBadgeText({
      text,
      tabId,
    });
  }

  if (color && browserAction.setBadgeTextColor) {
    await browserAction.setBadgeTextColor({
      color,
      tabId,
    });
  }

  if (background) {
    await browserAction.setBadgeBackgroundColor({
      color: background,
      tabId,
    });
  }
}

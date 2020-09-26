import { browser, Tabs } from 'webextension-polyfill-ts';

import { hasPermission } from './permissions';
import { KibanaPlus } from '../const';

import activeIcon from '../icons/active.svg';
import inactiveIcon from '../icons/inactive.svg';
import prohibitedIcon from '../icons/prohibited.svg';

export async function setTitle( tabId: number, title: string ) : Promise<void>
{
  return browser.browserAction.setTitle({ tabId, title });
}

export function setIcon( tabId: number, path: string ) : Promise<void>
{
  // console.log(`setIcon(${tabId}, ${path})`);

  return browser.browserAction.setIcon({
    path,
    tabId,
  });
}

export function setActiveIcon( tabId: number ) : Promise<void>
{
  // console.log(`setActiveIcon( ${tabId} )`, activeIcon );

  return setIcon( tabId, activeIcon );
}

export function setInactiveIcon( tabId: number ) : Promise<void>
{
  // console.log(`setInactiveIcon( ${tabId} )`, inactiveIcon );

  return setIcon( tabId, inactiveIcon );
}

export function setProhibitedIcon( tabId: number ) : Promise<void>
{
  // console.log(`setProhibitedIcon( ${tabId} )`, prohibitedIcon );

  return setIcon( tabId, prohibitedIcon );
}

/**
 * Update the browserAction icon / title
 *
 * @param tab
 */
export async function setIconForTab( tab: Tabs.Tab ) : Promise<void>
{
  if ( ! tab.id || ! tab.url || ! /^https?:/.test( tab.url ) ) {
    return setProhibitedIcon( tab.id as number );
  }

  try {
    const granted = await hasPermission( tab.url );

    await Promise.allSettled([
      setTitle( tab.id, `${granted ? 'Disable' : 'Enable'} ${KibanaPlus}` ),
      granted ? setActiveIcon( tab.id ) : setInactiveIcon( tab.id ),
    ]);
  } catch (error) {
    return setInactiveIcon( tab.id );
  }
}

export async function setIconForTabs( tabs: Tabs.Tab[] ) : Promise<void>
{
  await Promise.all(
    tabs.map( tab => setIconForTab( tab ) )
  );
}

export type SetBadgeOptions = {
  tabId: number;
  text?: string;
  color?: string;
  background?: string;
}

export async function setBadge({
  tabId,
  text,
  color,
  background,
}: SetBadgeOptions) : Promise<void>
{
  if ( tabId === undefined ) {
    throw new Error('tabId is required');
  }

  const { browserAction } = browser;

  if ( text ) {
    await browserAction.setBadgeText({
      text,
      tabId,
    });
  }

  if ( color && browserAction.setBadgeTextColor ) {
    await browserAction.setBadgeTextColor({
      color,
      tabId,
    });
  }

  if ( background ) {
    await browserAction.setBadgeBackgroundColor({
      color: background,
      tabId,
    });
  }
}

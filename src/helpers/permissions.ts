import {
  browser, Manifest, Permissions, 
} from 'webextension-polyfill-ts';

const validScheme = /^(?:\*|https?|wss?|ftps?|data|file):/;
const validHostname = /^\*$|^(\*\.)?[a-z0-9-.]+$/;
const validPathname = /^\/.+/;

export function isRequestableUrl( url: string ) : boolean
{
  try {
    const {
      protocol,
      hostname,
      pathname,
    } = new URL( url );

    if (
      ! validScheme.test(protocol) ||
      ( protocol !== 'file:' && ! validHostname.test(hostname) ) ||
      ! validPathname.test(pathname)
    ) {
      return false;
    }
  } catch (error) {
    console.error(error);

    return false;
  }

  return true;
}

export function requestPermissions( url: string, permissions?: Manifest.OptionalPermission[] ) : Promise<boolean>
{
  return browser.permissions.request({
    origins: [ url ],
    permissions,
  });
}

export function removePermissions( url: string, permissions?: Manifest.OptionalPermission[] ) : Promise<void>
{
  return browser.permissions.remove({
    origins: [ url ],
    permissions,
  });
}

export async function hasPermission( url: string ) : Promise<boolean>
{
  const allowed = await browser.permissions.contains({
    origins: [ url ],
  });

  return allowed;
}

export async function getAllPermissions() : Promise<Permissions.AnyPermissions>
{
  const permissions = await browser.permissions.getAll();

  return permissions;
}

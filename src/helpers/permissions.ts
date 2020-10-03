import {
  browser, Manifest, Permissions,
} from 'webextension-polyfill-ts';

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

/**
 * `browser.permissions.contains()` may throw an error if the `url` doesn't match a specific pattern.
 * For example, checking `moz-extension://` URLs will fail.
 */
export async function hasPermission( url: string ) : Promise<boolean>
{
  try {
    const allowed = await browser.permissions.contains({
      origins: [ url ],
    });

    return allowed;
  } catch (error) {
    return false;
  }
}

export async function getAllPermissions() : Promise<Permissions.AnyPermissions>
{
  const permissions = await browser.permissions.getAll();

  return permissions;
}

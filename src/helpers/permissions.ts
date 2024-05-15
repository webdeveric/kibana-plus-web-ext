import { permissions, type Manifest, type Permissions } from 'webextension-polyfill';

export function requestPermissions(url: string, manifestPermissions?: Manifest.OptionalPermission[]): Promise<boolean> {
  return permissions.request({
    origins: [url],
    permissions: manifestPermissions,
  });
}

export function removePermissions(url: string, manifestPermissions?: Manifest.OptionalPermission[]): Promise<boolean> {
  return permissions.remove({
    origins: [url],
    permissions: manifestPermissions,
  });
}

/**
 * `browser.permissions.contains()` may throw an error if the `url` doesn't match a specific pattern.
 * For example, checking `moz-extension://` URLs will fail.
 */
export async function hasPermission(url: string): Promise<boolean> {
  try {
    const allowed = await permissions.contains({
      origins: [url],
    });

    return allowed;
  } catch (error) {
    return false;
  }
}

export async function getAllPermissions(): Promise<Permissions.AnyPermissions> {
  return await permissions.getAll();
}

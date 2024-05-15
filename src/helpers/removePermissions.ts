import { permissions, type Manifest } from 'webextension-polyfill';

export function removePermissions(url: string, manifestPermissions?: Manifest.OptionalPermission[]): Promise<boolean> {
  return permissions.remove({
    origins: [url],
    permissions: manifestPermissions,
  });
}

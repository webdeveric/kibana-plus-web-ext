export function getValidUrl( url: string, defaultValue: string ) : string
{
  try {
    return new URL( url ).toString();
  } catch (error) {
    console.error(error);
  }

  return defaultValue;
}

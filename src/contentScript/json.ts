import { REDACTED } from '../const';

export function looksLikeJson( data: string ) : boolean
{
  return data !== REDACTED && data[ 0 ] === '[' || data[ 0 ] === '{';
}

export function replacer(key: string | number, value: string | number | Record<string, unknown> | boolean | null | undefined ) : unknown
{
  if (typeof value === 'string' && looksLikeJson( value ) ) {
    try {
      return JSON.parse( value );
    } catch (e) { // eslint-disable-line no-empty
    }
  }

  return value;
}

export function formatJson( unformattedJson: string ) : string
{
  return JSON.stringify(
    JSON.parse( unformattedJson ),
    replacer,
    4,
  ).normalize();
}

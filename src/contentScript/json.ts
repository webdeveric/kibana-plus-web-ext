import { REDACTED } from '../constants';

export function looksLikeJson( input: string ) : boolean
{
  if ( input === '[]' || input === '{}' || input === REDACTED ) {
    return false;
  }

  const data = input.trim();

  return (
    (data[ 0 ] === '[' && data[ data.length - 1 ] === ']') ||
    (data[ 0 ] === '{' && data[ data.length - 1 ] === '}')
  );
}

export function replacer( key: string, value: string | number | Record<string, unknown> | boolean | null | undefined ) : unknown
{
  if (typeof value === 'string' && looksLikeJson( value ) ) {
    try {
      return JSON.parse(value);
    } catch {
      // eslint-disable-line no-empty
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

import { getValidUrl } from './url';

export function findElements( mutations: MutationRecord[], selector: string ) : Element[]
{
  return mutations.reduce(
    (data: Element[], record: MutationRecord) => {
      const { target } = record;

      if ('matches' in target && (target as Element).matches( selector )) {
        data.push(target);
      }

      return data;
    },
    []
  );
}

export function createElement(tagName: string, className?: string, attributes?: Record<string, string>) : Element
{
  const element = document.createElement( tagName );

  if ( attributes ) {
    for ( const [ key, value ] of Object.entries( attributes ) ) {
      element.setAttribute( key, value );
    }
  }

  if ( className ) {
    element.classList.add( className );
  }

  return element;
}

export function createAnchor( href: string, text: string, className: string ) : Element
{
  const element = createElement(
    'a',
    className,
    {
      href: getValidUrl( href, '#' ),
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  );

  element.append( text );

  return element;
}

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

export function createElement(tagName: string, className?: string | string[], attributes?: Record<string, string>) : Element
{
  const element = document.createElement( tagName );

  if ( attributes ) {
    for ( const [ key, value ] of Object.entries( attributes ) ) {
      element.setAttribute( key, value );
    }
  }

  if ( className ) {
    const classNames = Array.isArray( className ) ? className : [ className ];

    element.classList.add( ...classNames );
  }

  return element;
}

export function createAnchor( href: string, content: string | Node, className?: string, attributes: Record<string, string> = {} ) : Element
{
  const element = createElement(
    'a',
    className,
    {
      ...attributes,
      href: getValidUrl( href, '#' ),
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  );

  element.append( content );

  return element;
}

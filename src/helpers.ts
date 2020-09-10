// eslint-disable-next-line @typescript-eslint/no-var-requires
const styles = require('./main.css');

export const JsonObjectRegExp = /\{.*\}/gs;

const REDACTED = '[REDACTED]';

export type AcceptNodeFn = (node: Node) => number;
export type ElementFactoryFn = (fragment: DocumentFragment) => Element | undefined;

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

export function getValidUrl( url: string, defaultValue: string ) : string
{
  try {
    return new URL( url ).toString();
  } catch (error) {
    console.error(error);
  }

  return defaultValue;
}

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

export function textHighlighter( root: Element, word: string | RegExp, elementFactory: ElementFactoryFn ) : typeof root
{
  const range = new Range();

  const acceptNode: AcceptNodeFn = word instanceof RegExp ?
    ( node => word.test( node.textContent as string ) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT ) :
    ( node => node.textContent?.includes( word ) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT );

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode,
    },
  );

  let currentNode: Node | null = walker.firstChild();

  while ( currentNode ) {
    let start;
    let length = 0;

    if ( word instanceof RegExp ) {
      const match = currentNode.textContent?.match( word );

      if ( match ) {
        start = match?.index;
        length = match[ 0 ].length;
      }
    } else {
      start = currentNode.textContent?.indexOf( word );
      length = word.length;
    }

    if ( start === undefined || start === -1 || ! length ) {
      continue;
    }

    range.setStart( currentNode, start );
    range.setEnd( currentNode, start + length );

    const replacement = elementFactory( range.cloneContents() );

    if ( replacement ) {
      range.extractContents();
      range.insertNode( replacement );
    }

    // Skip over the replacement if it contains the next matching node.
    do {
      currentNode = walker.nextSibling();
    } while ( currentNode && replacement && replacement.contains( currentNode ) );
  }

  return root;
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

export function highlightRedacted( root: Element ) : typeof root
{
  return textHighlighter(
    root,
    REDACTED,
    (fragment: DocumentFragment) : Element => {
      const element = createElement('del', styles.redacted);

      element.appendChild( fragment.firstChild as Element );

      return element;
    },
  );
}

export function highlightWebhookDetails( root: Element ) : typeof root
{
  textHighlighter(
    root,
    /"webhook_type": "[\w\d_-]+"/i,
    (fragment: DocumentFragment) : Element => {
      const element = createElement('span', styles.webhookType);

      element.appendChild( fragment.firstChild as Element );

      return element;
    },
  );

  textHighlighter(
    root,
    /(\d{4})-(\d{2})-(\d{2})T([012]\d):([0-6]\d):([0-5]\d)\.\d{3}Z/,
    (fragment: DocumentFragment) : Element => {
      const element = createElement('time', styles.timestamp);

      element.appendChild( fragment.firstChild as Element );

      return element;
    },
  );

  textHighlighter(
    root,
    /https?:\/\/[^"]+/,
    (fragment: DocumentFragment) : Element => {
      const href = fragment.firstChild?.textContent ?? '#';

      return createAnchor( href, href, styles.anchor );
    },
  );

  const arnRegExp = /arn:aws:lambda:(?<region>[^:]+):\d+:function:(?<lambdaName>[a-z0-9-:]+)/i;

  textHighlighter(
    root,
    /arn:aws:lambda:[a-z0-9-:]+/i,
    (fragment: DocumentFragment) : Element | undefined => {
      const arn: string = fragment.firstChild?.textContent ?? '';
      const match = arn.match( arnRegExp );

      if ( match ) {
        const { lambdaName, region } = match.groups ?? {};

        if ( lambdaName && region ) {
          const url = new URL('https://console.aws.amazon.com/lambda/home');

          url.searchParams.append('region', region);
          url.hash = `/functions/${lambdaName}`;

          return createAnchor( url.toString(), arn, styles.lambdaArn );
        }
      }
    }
  );

  textHighlighter(
    root,
    /\b[0-9A-F]{8}-[0-9A-F]{4}-\d[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}\b/i,
    (fragment: DocumentFragment) : Element => {
      const element = createElement('span', styles.uuid);

      element.appendChild( fragment.firstChild as Element );

      return element;
    }
  );

  return root;
}

export function processJsonContent( unformattedJson: string, elements: readonly Element[] ) : Element
{
  const code  = createElement('code', styles.json);
  const range = new Range();
  const textNode = new Text( formatJson( unformattedJson ) );

  code.appendChild( textNode );

  if ( textNode.length ) {
    let currentNode = code.lastChild as ChildNode;

    elements.forEach( element => {
      const textContent = element.textContent as string;
      const start = currentNode?.nodeValue?.indexOf( textContent );
      const end = textContent?.length;

      if ( start === undefined || start === -1 || ! end ) {
        return;
      }

      range.setStart( currentNode, start );
      range.setEnd( currentNode, start + end );
      range.surroundContents( document.createElement( element.tagName ) );

      currentNode = code.lastChild as Element;
    });
  }

  return highlightWebhookDetails( highlightRedacted( code ) );
}

export function processTextContent( textContent: string, originalNodes: readonly ChildNode[] ) : DocumentFragment
{
  const fragment = new DocumentFragment();
  const textNode = new Text( textContent );
  const originalElements = originalNodes.filter( node => node.nodeType === Node.ELEMENT_NODE ) as Element[];

  fragment.appendChild( textNode );

  for ( const match of textContent.matchAll( JsonObjectRegExp ) ) {
    if ( match.index !== undefined ) {
      // TODO maybe account for multiple JSON strings in the textContent
      const jsonNode = match.index === 0 ? textNode : textNode.splitText( match.index );

      if ( jsonNode.nodeValue ) {
        jsonNode.replaceWith( processJsonContent( jsonNode.nodeValue, originalElements ) );
      }
    }
  }

  return fragment;
}

export function processElement( element: Element ) : void
{
  if ( element && element.childNodes.length && element.textContent ) {
    const fragment = processTextContent(
      element.textContent,
      Array.from( element.childNodes ),
    );

    if ( fragment.childNodes.length ) {
      const container = element.cloneNode() as Element;

      container.appendChild( fragment );

      container.normalize();

      container.classList.add( styles.container );

      element.replaceWith( container );
    }
  }
}

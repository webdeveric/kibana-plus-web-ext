export type AcceptNodeFn = (node: Node) => number;

export type ElementFactoryFn = (fragment: DocumentFragment, match?: RegExpMatchArray) => Element | undefined;

export type WordBounds = {
  start: number,
  end: number,
  match?: RegExpMatchArray
};

export type WordBoundsFn = (text: string) => WordBounds | undefined;

export function findWordBoundsRegExp( text: string, pattern: RegExp ) : WordBounds | undefined
{
  const match = text.match( pattern );

  if ( match && match.length ) {
    const start = match.index as number;
    const end = start + match[ 0 ].length;

    return {
      start,
      end,
      match,
    };
  }
}

export function findWordBoundsString( text: string, word: string ) : WordBounds | undefined
{
  const start = text.indexOf( word );

  if ( start >= 0 && word.length ) {
    return {
      start,
      end: start + word.length,
    };
  }
}

export const findWordBounds = (search: string | RegExp) : WordBoundsFn => search instanceof RegExp ?
  (text: string) => findWordBoundsRegExp(text, search) :
  (text: string) => findWordBoundsString(text, search);

export function replaceText( root: Element, word: string | RegExp, elementFactory: ElementFactoryFn ) : typeof root
{
  const range = new Range();

  const acceptNode: AcceptNodeFn = word instanceof RegExp ?
    ( node => word.test( node.textContent as string ) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT ) :
    ( node => node.textContent?.includes( word ) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT );

  const getBounds = findWordBounds( word );

  const walker = document.createTreeWalker( root, NodeFilter.SHOW_TEXT, { acceptNode } );

  let currentNode: Node | null = walker.firstChild();

  while ( currentNode ) {
    const bounds = getBounds( currentNode.textContent as string );

    if ( ! bounds ) {
      continue;
    }

    range.setStart( currentNode, bounds.start );
    range.setEnd( currentNode, bounds.end );

    const replacement = elementFactory( range.cloneContents(), bounds.match );

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

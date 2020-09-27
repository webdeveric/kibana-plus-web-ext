import * as replacers from './replacers';

import { createElement } from './elements';
import { formatJson } from './json';
import { JsonObjectRegExp } from '../const';
import { replaceText } from './text';
import { sequence } from './replacer';

import styles from './main.css';

const modifyJson = sequence( ...Object.values( replacers ) );

export function processJsonContent( unformattedJson: string, elements: readonly Element[] ) : Element
{
  const code = createElement('code', styles.json);

  code.append( formatJson( unformattedJson ) );

  const element = modifyJson( code );

  if ( elements.length ) {
    const wordsToMatch = elements.reduce(
      (words, element) => {
        if ( element.textContent ) {
          words.add( element.textContent );
        }

        return words;
      },
      new Set()
    );

    const markedWordsRegExp = new RegExp( [ ...wordsToMatch ].join('|') );

    replaceText(
      code,
      markedWordsRegExp,
      (fragment: DocumentFragment) : Element => {
        const element = createElement('mark');

        element.appendChild( fragment.firstChild as Element );

        return element;
      }
    );
  }

  return element;
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

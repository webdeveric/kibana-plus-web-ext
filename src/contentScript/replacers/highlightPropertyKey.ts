import { createElement } from '../elements';
import { makeTextReplacer } from '../replacer';

import styles from '../main.css';

export const highlightPropertyKey = makeTextReplacer(
  /"(?<propertyKey>[^"]+)"(?=:\s)/i,
  (fragment: DocumentFragment, match?: RegExpMatchArray) : Element => {
    const quote = createElement('span', styles.propertyKeyQuote);

    quote.append('"');

    const element = createElement('span', styles.propertyKey);

    element.append( quote );
    element.append( match?.groups?.propertyKey as string );
    element.append( quote.cloneNode(true) );

    return element;
  },
);

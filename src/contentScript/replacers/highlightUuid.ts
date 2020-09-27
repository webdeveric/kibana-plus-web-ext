import { createElement } from '../elements';
import { makeTextReplacer } from '../replacer';

import styles from '../main.css';

export const highlightUuid = makeTextReplacer(
  /(?<=")[0-9A-F]{8}-[0-9A-F]{4}-\d[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}(?=")/i,
  (fragment: DocumentFragment) : Element => {
    const element = createElement('span', styles.uuid);

    element.append( fragment );

    return element;
  }
);

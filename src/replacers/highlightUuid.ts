import { createElement } from '../elements';
import { makeTextReplacer } from '../replacer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const styles = require('../main.css');

export const highlightUuid = makeTextReplacer(
  /\b[0-9A-F]{8}-[0-9A-F]{4}-\d[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}\b/i,
  (fragment: DocumentFragment) : Element => {
    const element = createElement('span', styles.uuid);

    element.appendChild( fragment.firstChild as Element );

    return element;
  }
);

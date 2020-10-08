import { createElement } from '../elements';
import { makeTextReplacer } from '../replacer';
import { REDACTED } from '../../constants';

import styles from '../main.css';

export const highlightRedacted = makeTextReplacer(
  REDACTED,
  (fragment: DocumentFragment) : Element => {
    const element = createElement('del', styles.redacted);

    element.append( fragment );

    return element;
  }
);

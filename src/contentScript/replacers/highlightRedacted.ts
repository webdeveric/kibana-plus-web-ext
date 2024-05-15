import { REDACTED } from '../../constants';
import { createElement } from '../elements';
import styles from '../main.css';
import { makeTextReplacer } from '../replacer';


export const highlightRedacted = makeTextReplacer(
  REDACTED,
  (fragment: DocumentFragment) : Element => {
    const element = createElement('del', styles.redacted);

    element.append( fragment );

    return element;
  },
);

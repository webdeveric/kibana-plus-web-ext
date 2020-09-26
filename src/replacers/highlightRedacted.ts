import { createElement } from '../elements';
import { makeTextReplacer } from '../replacer';
import { REDACTED } from '../const';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const styles = require('../main.css');
// import styles from '../main.css';

export const highlightRedacted = makeTextReplacer(
  REDACTED,
  (fragment: DocumentFragment) : Element => {
    const element = createElement('del', styles.redacted);

    element.append( fragment );

    return element;
  }
);

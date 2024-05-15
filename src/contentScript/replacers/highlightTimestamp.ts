import { createElement } from '../elements';
import styles from '../main.css';
import { makeTextReplacer } from '../replacer';


/**
 * This will wrap timestamp strings that are enclosed with quotes.
 */
export const highlightTimestamp = makeTextReplacer(
  /(?<=")(\d{4})-(\d{2})-(\d{2})T([012]\d):([0-6]\d):([0-5]\d)\.\d{3}Z(?=")/,
  (fragment: DocumentFragment) : Element => {
    const element = createElement('time', styles.timestamp);

    element.setAttribute('title', new Date( fragment.textContent as string ).toString() );
    element.append( fragment );

    return element;
  },
);

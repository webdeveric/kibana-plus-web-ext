import { createAnchor } from '../elements';
import styles from '../main.css';
import { makeTextReplacer } from '../replacer';


export const createAnchors = makeTextReplacer(
  /(?<=")https?:\/\/.+(?=")+/,
  (fragment: DocumentFragment) : Element => createAnchor(fragment.textContent ?? '#', fragment, styles.anchor, { title: 'Open in new tab' }),
);

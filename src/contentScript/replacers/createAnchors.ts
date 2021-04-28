import { createAnchor } from '../elements';
import { makeTextReplacer } from '../replacer';

import styles from '../main.css';

export const createAnchors = makeTextReplacer(
  /(?<=")https?:\/\/.+(?=")+/,
  (fragment: DocumentFragment) : Element => createAnchor(fragment.textContent ?? '#', fragment, styles.anchor, { title: 'Open in new tab' }),
);

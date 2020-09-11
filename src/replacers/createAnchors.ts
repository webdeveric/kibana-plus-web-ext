import { createAnchor } from '../elements';
import { makeTextReplacer } from '../replacer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const styles = require('../main.css');

export const createAnchors = makeTextReplacer(
  /(?<=")https?:\/\/.+(?=")+/,
  (fragment: DocumentFragment) : Element => createAnchor(fragment.textContent ?? '#', fragment, styles.anchor)
);

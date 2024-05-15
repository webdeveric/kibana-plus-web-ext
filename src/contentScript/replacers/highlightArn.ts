import { createElement } from '../elements';
import styles from '../main.css';
import { makeTextReplacer } from '../replacer';


export const highlightArn = makeTextReplacer(
  /(?<=")arn:[a-z0-9:_-]+(?=")/i,
  (fragment: DocumentFragment): Element => {
    const element = createElement('span', styles.arn);

    element.append( fragment );

    return element;
  },
);

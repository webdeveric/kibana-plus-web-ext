import { createElement } from '../elements';
import { makeTextReplacer } from '../replacer';

import styles from '../main.css';

export const highlightWebhookType = makeTextReplacer(
  /"webhook_type": "[\w\d_-]+"/i,
  (fragment: DocumentFragment) : Element => {
    const element = createElement('span', styles.webhookType);

    element.append( fragment );

    return element;
  },
);

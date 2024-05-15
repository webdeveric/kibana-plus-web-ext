import { createElement } from '../elements';
import styles from '../main.css';
import { makeTextReplacer } from '../replacer';


export const highlightWebhookType = makeTextReplacer(
  /"webhook_type": "[\w\d_-]+"/i,
  (fragment: DocumentFragment) : Element => {
    const element = createElement('span', styles.webhookType);

    element.append( fragment );

    return element;
  },
);

import { createAnchor } from '../elements';
import { makeTextReplacer } from '../replacer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const styles = require('../main.css');
// import styles from '../main.css';

export const createLambdaArnAnchor = makeTextReplacer(
  /\barn:aws:lambda:(?<region>[^:]+):\d+:function:(?<name>[a-z0-9-:]+)\b/i,
  (fragment: DocumentFragment, match?: RegExpMatchArray) : Element | undefined => {
    if ( match ) {
      const { name, region } = match.groups ?? {};

      if ( name && region ) {
        const url = new URL('https://console.aws.amazon.com/lambda/home');

        url.searchParams.append('region', region);
        url.hash = `/functions/${name}`;

        return createAnchor( url.toString(), fragment, styles.anchor );
      }
    }
  }
);

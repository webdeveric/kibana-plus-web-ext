import { createAnchor } from '../elements';
import { makeTextReplacer } from '../replacer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const styles = require('../main.css');

const arnRegExp = /arn:aws:lambda:(?<region>[^:]+):\d+:function:(?<lambdaName>[a-z0-9-:]+)/i;

export const createLambdaArnAnchor = makeTextReplacer(
  /arn:aws:lambda:[a-z0-9-:]+/i,
  (fragment: DocumentFragment) : Element | undefined => {
    const arn: string = fragment.firstChild?.textContent ?? '';
    const match = arn.match( arnRegExp );

    if ( match ) {
      const { lambdaName, region } = match.groups ?? {};

      if ( lambdaName && region ) {
        const url = new URL('https://console.aws.amazon.com/lambda/home');

        url.searchParams.append('region', region);
        url.hash = `/functions/${lambdaName}`;

        return createAnchor( url.toString(), arn, styles.lambdaArn );
      }
    }
  }
);

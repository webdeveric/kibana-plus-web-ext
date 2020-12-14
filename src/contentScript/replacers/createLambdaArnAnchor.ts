import { createAnchor } from '../elements';
import { makeTextReplacer } from '../replacer';

import styles from '../main.css';

function getAwsLambdaUrl({
  functionName,
  region,
}: {
  functionName: string;
  region?: string;
}): URL {
  const url = new URL('https://console.aws.amazon.com/lambda/home');

  url.hash = `/functions/${functionName}`;

  if ( region ) {
    url.searchParams.append('region', region);
  }

  return url;
}

export const createLambdaArnAnchor = makeTextReplacer(
  /\barn:aws:lambda:(?<region>[^:]+):\d+:function:(?<functionName>[a-z0-9-:]+)\b/i,
  (fragment: DocumentFragment, match?: RegExpMatchArray) : Element | undefined => {
    if ( match ) {
      const { functionName, region } = match.groups ?? {};

      if ( functionName && region ) {
        const url = getAwsLambdaUrl({ functionName, region });

        return createAnchor( url.toString(), fragment, styles.anchor, { title: 'View on AWS' } );
      }
    }
  }
);

export const createLambdaAnchor = makeTextReplacer(
  /(?<="functionName":\s")(?<functionName>.+)(?=")/,
  (fragment: DocumentFragment, match?: RegExpMatchArray) : Element | undefined => {
    if ( match ) {
      const { functionName } = match.groups ?? {};

      if ( functionName ) {
        const url = getAwsLambdaUrl({ functionName });

        return createAnchor( url.toString(), fragment, styles.anchor, { title: 'View on AWS' } );
      }
    }
  }
);

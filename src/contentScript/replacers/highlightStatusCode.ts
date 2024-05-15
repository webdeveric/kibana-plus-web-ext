import { createElement } from '../elements';
import styles from '../main.css';
import { makeTextReplacer } from '../replacer';


function inRange( num: number, lower: number, upper: number ): boolean {
  return num >= lower && num <= upper;
}

type InclusiveRange = [ lower: number, upper: number ];

function getClassNameFromStatusCode( statusCode: string ): string {
  const code = parseInt(statusCode, 10);

  const ranges: InclusiveRange[] = [
    [ 100, 199 ],
    [ 200, 299 ],
    [ 300, 399 ],
    [ 400, 499 ],
    [ 500, 599 ],
  ];

  for ( const [ lower, upper ] of ranges ) {
    if ( inRange( code, lower, upper ) ) {
      return styles[ `statusCode${lower}` ];
    }
  }

  return styles.statusCode;
}

export const highlightStatusCode = makeTextReplacer(
  /(?<="statusCode":\s)(?<statusCode>\d+)/,
  (_fragment: DocumentFragment, match?: RegExpMatchArray): Element => {
    const element = createElement('span', styles.statusCode);
    const statusCode = match?.groups?.statusCode as string;

    element.classList.add(getClassNameFromStatusCode(statusCode));
    element.append(statusCode);

    return element;
  },
);

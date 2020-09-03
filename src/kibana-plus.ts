// eslint-disable-next-line @typescript-eslint/no-var-requires
const styles = require('./main.css');

console.info('Kibana ➕ loaded');

function looksLikeJson( data: string ) : boolean
{
  return data !== '[REDACTED]' && data[ 0 ] === '[' || data[ 0 ] === '{';
}

type Unmarked = {
  words: Set<string>,
  json: string,
};

function unmark( json: string ) : Unmarked
{
  const words = new Set<string>();
  const marked = json.matchAll(/<mark>(.+?)<\/mark>/g);

  for ( const [ , item ] of marked ) {
    words.add( item );
  }

  return {
    words,
    json: json.replace(/<\/?mark>/g, ''),
  };
}

function remark( unmarked: Unmarked ) : string
{
  return [ ...unmarked.words ].reduce( (json, word) => json.replace(word, `<mark>${word}</mark>`), unmarked.json );
}

function replacer(key: string | number, value: string | number | Record<string, unknown> | boolean | null | undefined ) : unknown
{
  if (typeof value === 'string' && looksLikeJson( value ) ) {
    try {
      return JSON.parse( value );
    } catch (e) { // eslint-disable-line no-empty
    }
  }

  return value;
}

function wrapRedacted( json: string ) : string
{
  return json.replace(
    /(\[REDACTED\])/g,
    `<del class="${styles.redacted}">$1</del>`
  );
}

function prettyJson( unformattedJson: string ) : string
{
  const { words, json } = unmark( unformattedJson );

  const pretty = JSON.stringify(
    JSON.parse( json ),
    replacer,
    4,
  );

  return wrapRedacted(
    remark(
      {
        words,
        json: pretty,
      },
    ),
  );
}

const subjectsSelector: string = [
  'event',
  '@message',
  '@event.eventData',
  '@event.eventParams',
  '@event.requestData',
  '@event.graphQlResponse',
  '@event.restResponse',
].map((subject: string): string => `[data-test-subj$="${subject}"]`).join(',');

const observer = new MutationObserver(mutations => {
  const targets: Element[] = mutations.reduce(
    (data: Element[], record: MutationRecord) => {
      const { target } = record;

      if ('matches' in target && (target as Element).matches(subjectsSelector)) {
        data.push(target);
      }

      return data;
    },
    []
  );

  targets.forEach((element: Element) => {
    const prettyHTML = element.innerHTML.replace(/\{.*\}/gs, (match: string): string => {
      try {
        return `<div class="${styles.code}">${prettyJson(match)}</div>`;
      } catch (e) {
        return match;
      }
    });

    element.innerHTML = prettyHTML;
  });
});

observer.observe(document, {
  subtree: true,
  attributes: true,
});

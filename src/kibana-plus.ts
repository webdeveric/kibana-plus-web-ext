// eslint-disable-next-line @typescript-eslint/no-var-requires
const styles = require('./main.css');

console.info('Kibana ➕ loaded');

function looksLikeJson( data: string ) : boolean
{
  return data[ 0 ] === '[' || data[ 0 ] === '{';
}

function replacer(key: string | number, value: string | number | Record<string, unknown> | boolean | null | undefined ) : unknown
{
  if (typeof value === 'string' && looksLikeJson( value ) ) {
    try {
      return JSON.parse(value);
    } catch (e) { // eslint-disable-line no-empty
    }
  }

  return value;
}

function prettyJson( json: string ) : string
{
  return JSON.stringify(
    JSON.parse(json),
    replacer,
    4
  ).replace(
    /(\[REDACTED\])/g,
    `<del class="${styles.redacted}">$1</del>`
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

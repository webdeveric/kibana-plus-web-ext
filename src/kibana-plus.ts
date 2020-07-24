console.info('Kibana ➕ loaded');

function replacer(key: string | number, value: string | number | Record<string, unknown> | boolean | null | undefined ) {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) { // eslint-disable-line no-empty
    }
  }

  return value;
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
        let prettyJson = JSON.stringify(JSON.parse(match), replacer, 4);

        prettyJson = prettyJson.replace(/\[REDACTED\]/g, '<span style="background: rgba(0,0,0,.5); color: #FFF; font-weight: 100; padding: 0 .25em; display: inline-block; line-height: 1.8; border-radius: 5px;">[REDACTED]</span>');

        return `<div style="background-color: #F5F6F7; color: #575757; display: inline-block; vertical-align: top; padding: .5em; font: 1.2em/1.5 monospace; border-radius: 5px;">${prettyJson}</div>`;
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

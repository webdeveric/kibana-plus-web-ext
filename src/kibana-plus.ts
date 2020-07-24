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

        prettyJson = prettyJson.replace(/(\[REDACTED\])/g, '<del style="background: #000; color: #FFF; text-decoration: none; letter-spacing: 0.12em;">$1</del>');

        return `<div style="background-color: #F7F9FB; display: inline-block; vertical-align: top; padding: .5em; line-height: 1.5; font-size 1.2em; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;">${prettyJson}</div>`;
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

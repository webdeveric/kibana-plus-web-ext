import { findElements } from './elements';
import { processElement } from './process';

console.info('Kibana ➕ loaded');

const subjectsSelector: string = [
  'event',
  '@message',
  '@event.msg',
  '@event.eventData',
  '@event.eventParams',
  '@event.requestData',
  '@event.graphQlResponse',
  '@event.restResponse',
].map((subject: string): string => `tr[data-test-subj$="${subject}"]`).join(',');

const observer = new MutationObserver( (mutations: MutationRecord[]) => {
  findElements( mutations, subjectsSelector ).forEach( (element: Element) => {
    const span = element.querySelector('.doc-viewer-value > span');

    if ( span ) {
      processElement( span );
    }
  });
});

observer.observe(document, {
  subtree: true,
  attributes: true,
  attributeFilter: [ 'data-test-subj' ],
});

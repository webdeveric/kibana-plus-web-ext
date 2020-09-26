import {
  Emoji, KibanaPlus, ReadyStates,
} from './const';
import { findElements } from './elements';
import { processElement } from './process';

console.log(
  `%c${KibanaPlus} content script loaded ${Emoji.Horns}`,
  'display: flex; font-size: 20px; background-color: #3CAED2; color: #FFF; border-radius: .15em; padding: .25em .5em;',
);

// The background script checks for this value so it does not insert multiple of this script.
window.KibanaPlus = window.KibanaPlus || {
  loaded: true,
};

function waitForContentLoaded(callback: () => void, checkDelay = 10) {
  if (document.readyState === ReadyStates.Complete) {
    callback();

    return;
  }

  setTimeout(waitForContentLoaded, checkDelay, callback, checkDelay);
}

function looksLikeKibana() : boolean
{
  return document.querySelector('body')?.getAttribute('id') === 'kibana-body';
}

function init() : void
{
  if ( ! looksLikeKibana() ) {
    console.log('This doesn\'t look like a Kibana page');

    return;
  }

  const subjectsSelector: string = [
    'event',
    '@message',
    '@event.msg',
    '@event.eventData',
    '@event.eventParams',
    '@event.requestData',
    '@event.graphQlResponse',
    '@event.restResponse',
    '@event.customContext.errorContext',
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
}

waitForContentLoaded( init );

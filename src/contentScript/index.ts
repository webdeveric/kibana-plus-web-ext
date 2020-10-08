import {
  Emoji, KibanaPlus, ReadyStates,
} from '../constants';
import { findElements } from './elements';
import { processElement } from './process';

console.log(`${KibanaPlus} content script loaded ${Emoji.ThumbsUp}`);

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

  console.log(`${KibanaPlus} initializing ${Emoji.HourGlassNotDone}`);

  const subjectsSelector: string = [
    'event',
    '@message',
    '@event.data.payload.attributes',
    '@event.eventData',
    '@event.eventParams',
    '@event.requestData',
    '@event.graphQlResponse',
    '@event.restResponse',
    '@event.msg',
    '@event.customContext.errorContext',
  ].map((subject: string): string => `tr[data-test-subj$="${subject}"]`).join(',');

  try {
    // Process any elements that are already showing.
    document.querySelectorAll(`:is(${subjectsSelector}) .doc-viewer-value > span`).forEach( span => processElement( span ) );
  } catch (error) {
    console.log(error);
  }

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

  console.log(
    `%c${KibanaPlus} content script initialized ${Emoji.Horns}`,
    'display: flex; font-size: 20px; background-color: #3CAED2; color: #FFF; border-radius: .15em; padding: .25em .5em;',
  );
}

waitForContentLoaded( init );

import type { ElementFactoryFn } from './text';
import { replaceText } from './text';

export type TextReplacerFn = (element: Element) => typeof element;

export const makeTextReplacer = (word: string | RegExp, elementFactory: ElementFactoryFn) : TextReplacerFn => (element: Element) => replaceText(element, word, elementFactory);

export function sequence( ...functions: TextReplacerFn[] ) : TextReplacerFn
{
  return functions.reduce(
    (prevFn, nextFn) => (element: Element) => nextFn( prevFn( element ) ),
    (element: Element) => element,
  );
}

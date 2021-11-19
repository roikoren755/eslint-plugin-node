import { ASTUtils } from '@typescript-eslint/experimental-utils';

export interface IDeprecated {
  since: string;
  replacedBy?: { name: string; supported: string }[] | string;
}

export type DeprecatedMap = ASTUtils.ReferenceTracker.TraceMap<IDeprecated>;

/**
 * Enumerate property names of a given object recursively.
 * @param {DeprecatedMap} trackMap The map for APIs to enumerate.
 * @param {string[]|undefined} path The path to the current map.
 * @returns {Generator<string>} The property names of the map.
 */
export function* enumeratePropertyNames(
  trackMap: ASTUtils.ReferenceTracker.TraceMap,
  path: string[] = [],
): Generator<string> {
  for (const key of Object.keys(trackMap)) {
    const value = trackMap[key];

    if (typeof value === 'object') {
      path.push(key);

      if (value[ASTUtils.ReferenceTracker.CALL]) {
        yield `${path.join('.')}()`;
      }

      if (value[ASTUtils.ReferenceTracker.CONSTRUCT]) {
        yield `new ${path.join('.')}()`;
      }

      if (value[ASTUtils.ReferenceTracker.READ]) {
        yield path.join('.');
      }

      yield* enumeratePropertyNames(value, path);

      path.pop();
    }
  }
}

import path from 'path';

import type { TSESLint } from '@typescript-eslint/utils';
import { Minimatch } from 'minimatch';
import type { IMinimatch } from 'minimatch';

import type { ImportTarget } from './import-target';

interface IDefinitionData {
  name: string[] | string;
  message?: string;
}

/**
 * Check if matched or not.
 * @param {IMinimatch} matcher The matcher.
 * @param {boolean} absolute The flag that the matcher is for absolute paths.
 * @param {ImportTarget} importee The importee information.
 */
const match = (matcher: IMinimatch, absolute: boolean, { filePath, name }: ImportTarget): boolean => {
  if (absolute) {
    return (!!filePath || filePath === '') && matcher.match(filePath);
  }

  return matcher.match(name);
};

/** Restriction. */
class Restriction {
  readonly #matchers: { absolute: boolean; matcher: IMinimatch; negate: boolean }[];

  readonly message: string;

  /**
   * Initialize this restriction.
   * @param {IDefinitionData} def The definition of a restriction.
   */
  constructor({ name, message }: IDefinitionData) {
    const names = Array.isArray(name) ? name : [name];

    this.#matchers = names.map((raw) => {
      const negate = raw.startsWith('!') && raw[1] !== '(';
      const pattern = negate ? raw.slice(1) : raw;
      const absolute = path.isAbsolute(pattern);
      const matcher = new Minimatch(pattern, { dot: true });

      return { absolute, matcher, negate };
    });
    this.message = message ? ` ${message}` : '';
  }

  /**
   * Check if a given importee is disallowed.
   * @param {ImportTarget} importee The importee to check.
   * @returns {boolean} `true` if the importee is disallowed.
   */
  match(importee: ImportTarget): boolean {
    return this.#matchers.reduce<boolean>(
      (ret, { absolute, matcher, negate }) =>
        negate ? ret && !match(matcher, absolute, importee) : ret || match(matcher, absolute, importee),
      false,
    );
  }
}

export type RestrictionDefinition = IDefinitionData | string;

/**
 * Create a restriction.
 * @param {string | IDefinitionData} def A definition.
 * @returns {Restriction} Created restriction.
 */
const createRestriction = (def: RestrictionDefinition): Restriction => {
  if (typeof def === 'string') {
    return new Restriction({ name: def });
  }

  return new Restriction(def);
};

/**
 * Create restrictions.
 * @param {RestrictionDefinition[]} defs Definitions.
 * @returns {Restriction[]} Created restrictions.
 */
const createRestrictions = (defs?: RestrictionDefinition[]): Restriction[] =>
  (defs ?? []).map((definition) => createRestriction(definition));

/**
 * Checks if given importees are disallowed or not.
 * @param {TSESLint.RuleContext} context - A context to report.
 * @param {ImportTarget[]} targets - A list of target information to check.
 * @param {number|undefined} optionIndex - The option index that might contain the restrictions setting.
 * @returns {void}
 */
export const checkRestricted = (
  context: TSESLint.RuleContext<string, readonly unknown[]>,
  targets: ImportTarget[],
  optionIndex = 0,
): void => {
  const restrictions = createRestrictions(context.options[optionIndex] as RestrictionDefinition[]);

  for (const target of targets) {
    const restriction = restrictions.find((r) => r.match(target));

    if (restriction) {
      context.report({
        node: target.node,
        messageId: 'restricted',
        data: { name: target.name, customMessage: restriction.message },
      });
    }
  }
};

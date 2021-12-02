import { ASTUtils } from '@typescript-eslint/experimental-utils';
import type { TSESLint } from '@typescript-eslint/experimental-utils';
import { lt, major } from 'semver';
import type { Range } from 'semver';

import { getConfiguredNodeVersion } from './get-configured-node-version';
import { getSemverRange } from './get-semver-range';

interface ISupportInfo {
  supported?: string;
  backported?: string[];
  experimental?: string;
}

export type SupportMap = ASTUtils.ReferenceTracker.TraceMap<ISupportInfo>;

export interface IRawOptions {
  version?: string;
  ignores?: string[];
}

interface IOptions {
  version: Range;
  ignores: Set<string>;
}

type Options = readonly [options: IRawOptions];

/**
 * Parses the options.
 * @param {TSESLint.RuleContext<string, Options>} context The rule context.
 * @param {Options} options The rule options.
 * @returns {{version:Range,ignores:Set<string>}} Parsed value.
 */
export const parseOptions = (context: TSESLint.RuleContext<string, Options>, options: Options): IOptions => {
  const [raw] = options;
  const filePath = context.getFilename();
  const version = getConfiguredNodeVersion(raw.version, filePath);
  const ignores = new Set(raw.ignores ?? []);

  return Object.freeze({ version, ignores });
};

/**
 * Check if it has been supported.
 * @param {ISupportInfo} info The support info.
 * @param {Range} configured The configured version range.
 */
const isSupported = ({ backported, supported }: ISupportInfo, configured: Range): boolean => {
  if (backported && backported.length >= 2 && !backported.every((v, i) => i === 0 || lt(backported[i - 1], v))) {
    throw new Error('Invalid BackportConfiguration');
  }

  if (!supported) {
    return false;
  }

  if (!backported || backported.length === 0) {
    return !configured.intersects(getSemverRange(`<${supported}`) as Range);
  }

  return !configured.intersects(
    getSemverRange(
      [...backported, supported].map((v, i) => (i === 0 ? `<${v}` : `>=${major(v)}.0.0 <${v}`)).join(' || '),
    ) as Range,
  );
};

/**
 * Get the formatted text of a given supported version.
 * @param {ISupportInfo} info The support info.
 */
const supportedVersionToString = ({ backported, supported }: ISupportInfo): string => {
  if (!supported) {
    return '(none yet)';
  }

  if (!backported || backported.length === 0) {
    return supported;
  }

  return `${supported} (backported: ^${backported.join(', ^')})`;
};

/**
 * Verify the code to report unsupported APIs.
 * @param {TSESLint.RuleContext<string, Options>} context The rule context.
 * @param {Options} appliedOptions The rule options.
 * @param {{modules:object,globals:object}} trackMap The map for APIs to report.
 * @returns {void}
 */
export const checkUnsupportedBuiltins = (
  context: TSESLint.RuleContext<string, Options>,
  appliedOptions: Options,
  trackMap: Partial<Record<'globals' | 'modules', SupportMap>>,
): void => {
  const options = parseOptions(context, appliedOptions);
  const tracker = new ASTUtils.ReferenceTracker(context.getScope(), { mode: 'legacy' });
  const references = [
    ...tracker.iterateCjsReferences(trackMap.modules ?? {}),
    ...tracker.iterateEsmReferences(trackMap.modules ?? {}),
    ...tracker.iterateGlobalReferences(trackMap.globals ?? {}),
  ];

  for (const reference of references) {
    const { node, path, info } = reference;
    const name = path.join('.');
    const supported = isSupported(info, options.version);

    if (!supported && !options.ignores.has(name)) {
      context.report({
        node,
        messageId: 'unsupported',
        data: { name, supported: supportedVersionToString(info), version: options.version.raw },
      });
    }
  }
};

import { ASTUtils } from '@typescript-eslint/experimental-utils';
import type { TSESLint } from '@typescript-eslint/experimental-utils';

export type MessageIds = 'preferGlobal' | 'preferModule';
export type Options = ['always' | 'never'];

type TrackMap = Record<'globals' | 'modules', ASTUtils.ReferenceTracker.TraceMap<true>>;

/**
 * Verifier for `prefer-global/*` rules.
 */
class Verifier {
  context: TSESLint.RuleContext<MessageIds, Options>;

  trackMap: TrackMap;

  /**
   * Initialize this instance.
   * @param {TSESLint.RuleContext} context The rule context to report.
   * @param {ASTUtils.} trackMap The track map.
   */
  constructor(context: TSESLint.RuleContext<MessageIds, Options>, trackMap: TrackMap) {
    this.context = context;
    this.trackMap = trackMap;
  }

  verify(): void {
    this.context.options[0] === 'never' ? this.verifyToPreferModules() : this.verifyToPreferGlobals();
  }

  /**
   * Verify the code to suggest the use of globals.
   * @returns {void}
   */
  verifyToPreferGlobals(): void {
    const { context, trackMap } = this;
    const tracker = new ASTUtils.ReferenceTracker(context.getScope(), { mode: 'legacy' });

    for (const { node } of [
      ...tracker.iterateCjsReferences(trackMap.modules),
      ...tracker.iterateEsmReferences(trackMap.modules),
    ]) {
      context.report({ node, messageId: 'preferGlobal' });
    }
  }

  /**
   * Verify the code to suggest the use of modules.
   * @returns {void}
   */
  verifyToPreferModules(): void {
    const { context, trackMap } = this;
    const tracker = new ASTUtils.ReferenceTracker(context.getScope());

    for (const { node } of tracker.iterateGlobalReferences(trackMap.globals)) {
      context.report({ node, messageId: 'preferModule' });
    }
  }
}

export const checkForPreferGlobal = (context: TSESLint.RuleContext<MessageIds, Options>, trackMap: TrackMap): void => {
  new Verifier(context, trackMap).verify();
};

export const schema = [{ enum: ['always', 'never'] }];

export const defaultOptions = ['always'] as const;

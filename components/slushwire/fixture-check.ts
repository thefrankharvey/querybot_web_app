// Typecheck-only: proves the v2 test fixture stays assignable to the v2 contract.
import fixture from '../../tests/fixtures/slushwire-v2.json';
import type { SlushWireIssueV2 } from './types';

export const slushwireV2Fixture = fixture as SlushWireIssueV2;

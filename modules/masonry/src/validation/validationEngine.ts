import type { TBrickType } from '../../@types/brick';
import type { TNotchType, TConnectionValidation } from '../../@types/tower';
import { matchRule, RULES_NESTED, RULES_ARG } from './connectionRules';

export class ValidationEngine {
    canConnect(
        parentName: string,
        parentType: TBrickType,
        childName: string,
        childType: TBrickType,
        notchType: TNotchType,
    ): TConnectionValidation {
        if (notchType === 'top-bottom') {
            return { isValid: true };
        }

        if (notchType === 'nested') {
            const result = matchRule(parentName, childName, notchType, RULES_NESTED);
            if (!result.matched) {
                return { isValid: false, reason: result.reason };
            }
            return { isValid: true };
        }

        if (notchType === 'right-left' || notchType === 'left-right') {
            const result = matchRule(parentName, childName, notchType, RULES_ARG);
            if (!result.matched) {
                return { isValid: false, reason: result.reason };
            }
            return { isValid: true };
        }

        return { isValid: true };
    }
}

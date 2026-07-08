import { useMemo, useCallback } from 'react';
import type { IBrick } from '../../@types/brick';
import type { TNotchType, TConnectionValidation } from '../../@types/tower';
import { ValidationEngine } from './validationEngine';

export function useBlockValidation() {
    const engine = useMemo(() => new ValidationEngine(), []);

    const canConnect = useCallback(
        (parent: IBrick, child: IBrick, notchType: TNotchType): TConnectionValidation => {
            return engine.canConnect(parent.name, parent.type, child.name, child.type, notchType);
        },
        [engine],
    );

    return { canConnect };
}

import { useState } from 'react';

/**
 * Returns a function that can be called to force a re-render of the component which calls it.
 */
export function useForceUpdate(): () => void {
    const [value, setValue] = useState(false);
    return () => setValue(!value);
}

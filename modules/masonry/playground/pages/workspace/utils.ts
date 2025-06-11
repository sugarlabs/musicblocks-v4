import type { Brick } from './data';

export function getBelowBricksIds(arr: Brick[], item: string): string[] {
    let result: string[] = [];

    function recursiveSearch(arr: Brick[], item: string) {
        arr.forEach((element, index) => {
            if (element.id === item) {
                arr.slice(index + 1, arr.length).map((el) => {
                    result = result.concat(el.childBricks);
                    result = result.concat(el.id);
                });
                return;
            }
            if (Array.isArray(element.children)) {
                recursiveSearch(element.children, item);
            }
        });
    }

    recursiveSearch(arr, item);
    return result;
}

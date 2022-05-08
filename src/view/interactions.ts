/**
 * hashmap structure
 * shortcutsList={
 *    "alt":{
*            //indicating alt+r
*            "r":[fun1,fun2],
*            "s":[fun1,fun2]
        *    },
 * "alt+shift":{
* *            //indicating shift+alt+r
*            "r":[fun1,fun2],
*            "s":[fun1,fun2]
        *    }
 * }
 */

interface shortcutsList {
    alt: {
        [alphabetKey: string]: CallableFunction[]
    },
    altShift: {
        [alphabetKey: string]: CallableFunction[]
    }
}

export let shortcutsList: shortcutsList = {
    alt: {},
    altShift: {}
};

/**
 * 
 * @param {string} key a shortcut key following the pattern `alt+key` or `alt+shift+key`.
 * @param {CallableFunction} callbackFun a function which will be runned when specified shortcut is
 *                                                                                 triggered 
 */
export function addShortcutsTriggerToList(
    key: string,
    callbackFun: CallableFunction
): void {
    key = key.toLowerCase().replaceAll(" ", "");
    let incAlt = key.includes("alt");
    let incShift = key.includes("shift");

    // removing alt , shift , + so i can get only the alphabet
    let alphabetKey = key.replaceAll("alt", "").replaceAll("shift", "").replaceAll("+", "");
    if (incAlt && !incShift) {
        shortcutsList.alt[alphabetKey] && shortcutsList.alt[alphabetKey].length ?
        shortcutsList.alt[alphabetKey].push(callbackFun) :
        shortcutsList.alt[alphabetKey] = [callbackFun];

    } else if (incAlt && incShift) {
        shortcutsList.altShift[alphabetKey] && shortcutsList.altShift[alphabetKey].length ?
        shortcutsList.altShift[alphabetKey].push(callbackFun) :
        shortcutsList.altShift[alphabetKey] = [callbackFun];
    }
}

export function addEventListenerOnWindow(): void {
    let keyList: string[] = [];

    window.addEventListener('keydown', (e) => {
        e.preventDefault();
        if (!keyList.includes(e.key.toLowerCase())) {
            keyList.push(e.key.toLowerCase());

            if ((keyList.includes('alt') || keyList.includes('option')) && keyList.includes('shift')) {

                // remove alt and shift from list and execute all the functions that are linked to remaining
                // keys inside list
                let keyListTemp = keyList.filter((key) => {
                    if (key == 'alt' || key == 'option' || key == 'shift') {
                        return false;
                    }
                    return true;
                });
                keyListTemp.map((key) => {
                    shortcutsList.altShift[key] && shortcutsList.altShift[key].map((func) => {
                        func();
                    });
                });
            } else if ((keyList.includes('alt') || keyList.includes('option')) && !keyList.includes('shift')) {
                // remove alt from list and execute all the functions that are linked to remaining
                // keys inside list
                let keyListTemp = keyList.filter((key) => {
                    if (key == 'alt' || key == 'option') {
                        return false;
                    }
                    return true;
                });
                keyListTemp.map((key) => {
                    shortcutsList.alt[key] && shortcutsList.alt[key].map((func) => {
                        func();
                    });
                });
            }
        }
    });
    window.addEventListener('keyup', (e) => {
        keyList = keyList.filter((key) => {
            if (key == e.key.toLowerCase()) {
                return false;
            }
            return true;
        });
    });
}
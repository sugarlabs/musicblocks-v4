import { IConfig, IComponent } from '../@types';

import { registerElementSpecificationEntries } from '@sugarlabs/musicblocks-v4-lib';

// -- private variables ----------------------------------------------------------------------------

/** File name of the selected config file. */
const _configFile = 'base';

/** Object mapping mounted component names to the  */
const _components: { [name: string]: IComponent } = {};

// -- public functions -----------------------------------------------------------------------------

/**
 * Returns a component module by it's name.
 * @param name name of the component
 * @returns component module if valid name else `null`
 */
export function getComponent(name: string): IComponent | null {
    return name in _components ? _components[name] : null;
}

// -------------------------------------------------------------------------------------------------

// load the config file
import(`./${_configFile}.json`).then((_config) => {
    const config: IConfig = _config.default;

    let importPromises: Promise<[string, IComponent]>[] = [];

    // for each component entry in the config file
    config.components.forEach((componentEntry) => {
        // import the component module using the component name in the component entry
        importPromises.push(
            import(`../components/${componentEntry.name}`).then((component: IComponent) => {
                // mount the component
                component.mount();

                if ('elements' in componentEntry) {
                    // register the syntax elements specified in the component entry from the component
                    // module's specification
                    if (typeof componentEntry.elements === 'boolean') {
                        if (componentEntry.elements) {
                            registerElementSpecificationEntries(component.specification!);
                        }
                    } else {
                        registerElementSpecificationEntries(
                            Object.fromEntries(
                                componentEntry.elements
                                    .map((elementName) => [
                                        elementName,
                                        component.specification![elementName],
                                    ])
                                    .filter(([_, specification]) => specification !== undefined),
                            ),
                        );
                    }
                }

                return [componentEntry.name, component];
            }),
        );
    });

    Promise.all(importPromises).then((components) => {
        components.forEach(([name, component]) => {
            _components[name] = component;

            // initializes the components after they are mounted
            setTimeout(() => component.setup());
        });
    });
});

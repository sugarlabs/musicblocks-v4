import { IConfig, IComponent } from '../@types';

import { registerElementSpecificationEntries } from '@sugarlabs/musicblocks-v4-lib';

// -------------------------------------------------------------------------------------------------

/** File name of the selected config file. */
const configFile = 'base';

// load the config file
import(`./${configFile}.json`).then((_config) => {
    const config: IConfig = _config.default;

    // for each component entry in the config file
    config.components.forEach((componentEntry) => {
        // import the component module using the component name in the component entry
        import(`../components/${componentEntry.name}`).then((component: IComponent) => {
            const root = document.getElementById('root')!;
            const wrapper = document.createElement('div');
            wrapper.id = `${componentEntry.name}-wrapper`;
            root.appendChild(wrapper);

            // mount the component
            component.mount(wrapper);

            // register the syntax elements specified in the component entry from the component
            // module's specification
            if (typeof componentEntry.elements === 'boolean') {
                if (componentEntry.elements) {
                    registerElementSpecificationEntries(component.specification);
                }
            } else {
                registerElementSpecificationEntries(
                    Object.fromEntries(
                        componentEntry.elements
                            .map((elementName) => [
                                elementName,
                                component.specification[elementName],
                            ])
                            .filter(([_, specification]) => specification !== undefined),
                    ),
                );
            }
        });
    });
});

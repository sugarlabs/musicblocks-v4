import { PluginManager } from './plugin-manager';

// Core plugins
import { PlayNotePlugin } from './music-blocks-plugins/audio-plugins';
import { ForwardPlugin, RightPlugin, LeftPlugin } from './music-blocks-plugins/movement-plugins';
import {
    SetContextInstrumentPlugin,
    SetContextVolumePlugin,
} from './music-blocks-plugins/context-plugins';
import {
    ClearPlugin,
    ScalarStepPlugin,
    SetKeyPlugin,
    SetMasterVolumePlugin,
    OnNoteDoPlugin,
} from './music-blocks-plugins/system-plugins';

/**
 * Centralized plugin registry for all Music Blocks testing plugins
 */
export function registerAllPlugins(pluginManager: PluginManager): void {
    // Audio plugins
    pluginManager.registerPlugin(new PlayNotePlugin());

    // Movement plugins
    pluginManager.registerPlugin(new ForwardPlugin());
    pluginManager.registerPlugin(new RightPlugin());
    pluginManager.registerPlugin(new LeftPlugin());

    // Context plugins
    pluginManager.registerPlugin(new SetContextInstrumentPlugin());
    pluginManager.registerPlugin(new SetContextVolumePlugin());

    // System plugins
    pluginManager.registerPlugin(new ClearPlugin());
    pluginManager.registerPlugin(new ScalarStepPlugin());
    pluginManager.registerPlugin(new SetKeyPlugin());
    pluginManager.registerPlugin(new SetMasterVolumePlugin());
    pluginManager.registerPlugin(new OnNoteDoPlugin());
}

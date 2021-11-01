// -- Shared ---------------------------------------------------------------------------------------

export type TArtboardDimensions = {
    width: number;
    height: number;
};

/**
 * Defines the position co-ordinates of the sprite.
 */
export type TArtboardSpritePosition = {
    x: number;
    y: number;
};

// -- Artboard Sprite ------------------------------------------------------------------------------

/**
 * Defines the color properties of the sprite.
 */
export type TArtboardSpriteColor = {
    accent: string;
    outline: string;
};

/**
 * Interface for the Artboard Sprite sub-component's View-Model props.
 */
export interface IArtboardSpriteProps {
    spriteID: string;
    artboardID: string;
    initialPosition: TArtboardSpritePosition;
    initialHeading: number;
    color: TArtboardSpriteColor;
}

/**
 * Interface for the Artboard Sprite sub-component's Model class.
 */
export interface IArtboardSpriteModel {
    spriteID: string;
    artboardID: string;
    position: TArtboardSpritePosition;
    heading: number;
    color: TArtboardSpriteColor;
}

/**
 * Interface for the Artboard Sprite sub-component's View props.
 */
export interface IArtboardSpriteViewProps {
    id: string;
    position: TArtboardSpritePosition;
    updatePosition: (position: TArtboardSpritePosition) => void;
    heading: number;
    color: TArtboardSpriteColor;
    dispatchSignal: (signalName: string, ...args: unknown[]) => void;
}

// -- Artboard -------------------------------------------------------------------------------------

/**
 * Interface for the Artboard sub-component's View-Model props.
 */
export interface IArtboardProps {
    artboardID: string;
    spriteID: string;
    initialPosition: TArtboardSpritePosition;
    initialHeading: number;
}

/**
 * Interface for the Artboard sub-component's Model class.
 */
export interface IArtboardModel {
    artboardID: string;
    spriteID: string;
    position: TArtboardSpritePosition;
    heading: number;
}

/**
 * Interface for the Artboard sub-component's View props.
 */
export interface IArtboardViewProps {
    id: string;
    position: TArtboardSpritePosition;
    updatePosition(position: TArtboardSpritePosition): void;
    heading: number;
    updateHeading(heading: number): void;
    dispatchSignal: (signalName: string, ...args: unknown[]) => void;
}

// -- Artboard Manager -----------------------------------------------------------------------------

/**
 * Interface for the Artboard Manager component's Model class.
 */
export interface IArtboardManagerModel {
    viewportDimensions: [number, number];
    artboardMap: { [key: string]: string };
    addArtboard: () => void;
    removeArtboard: (id: string, parameter?: 'artboard' | 'sprite') => boolean;
}

/**
 * Interface for the Artboard Manager component's View props.
 */
export interface IArtboardManagerViewProps {
    /** Viewport dimensions as [width, height]. */
    viewportDimensions: [number, number];
    artboardMap: { [key: string]: string };
    children: {
        ArtboardSprite: (props: IArtboardSpriteProps) => JSX.Element;
        Artboard: (props: IArtboardProps) => JSX.Element;
    };
    initialPosition: TArtboardSpritePosition;
    initialHeading: number;
}

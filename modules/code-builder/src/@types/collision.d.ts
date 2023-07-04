export type TCollisionObject = {
    /** unique ID of the object in the collision space */
    id: string;
    /** x-coordinate of the centre of the object */
    x: number;
    /** y-coordinate of the centre of the object */
    y: number;
    /** width of the object */
    width: number;
    /** height of the object */
    height: number;
};

export interface ICollisionSpace {
    /**
     * Sets collision space properties.
     */
    setOptions(options: {
        /** whether objects are circles or rectangles */
        objType: 'circle' | 'rect';
    }): void;

    /**
     * Adds objects to the collision space.
     */
    addObjects(objects: TCollisionObject[]): void;

    /**
     * Removes objects from the collision space.
     */
    delObjects(objects: TCollisionObject[]): void;

    /**
     * Returns objects in the collision space that are colliding with the input object.
     */
    checkCollision(object: TCollisionObject): string[];

    /**
     * Clears the collision space of all objects.
     */
    reset(): void;
}

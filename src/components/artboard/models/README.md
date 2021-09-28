# ArtBoard Model

The ArtBoard Model is responsible for storing the structure of the class and the parameters used by the artBoardDraw function. There are four classes in the model, which are called by the `ArtBoardSketch.tsx` and `ArtBoardTurtle.tsx`.

<ul>
<li> ArtBoardDraw.ts
<li> ArBoard.ts
<li> ArBoardManager.ts
<li> Turtle.ts
</ul>

---

&nbsp;

## ArtBoardDraw.ts

Responsible for storing the attributes (thickness and colour) of the line drawn on the artBoard. Each instance of `artBoardSketch.tsx` calls artBoardDraw constructor with color (RGB format) as the parameter.

| Parameter    | Type                   | Description                                              |
| ------------ | ---------------------- | -------------------------------------------------------- |
| StrokeWeight | number                 | Defines the thickness of the line drawn on the artBoard |
| StrokeColor  | [number,number, number] | Defines the colour [R, G, B] of the line drawn on the artBoard      |

Both of these parameters have their getter and setter to maintain encapsulation.

```
constructor(strokeColor : [number,number,number]){

}
```

## Turtle.ts

Responsible for creating a turtle; each Turtle is identified with a unique id. Each instance of `artBoardTurtle.tsx` calls Turtle with an id, the initial x-y position, and the initial rotation angle.

| Parameter   | Type                   | Description                                                                               |
| ----------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| id          | number                 | Each instance of Turtle is associated with a unique id                                   |
| turtleX     | number                 | Stores the initial x position of the turtle                                                |
| turtleY     | number                 | Stores the initial y position of the turtle                                                |
| turtleAngle | number                 | Stores the initial angle of the turtle                                                    |
| width       | number                 | Stores the width of the drawn Turtle.                                                     |
| height      | number                 | Stores the height of the drawn Turtle.                                                    |
| color       | [number,number,number] | Defines the colour of the Turtle. Each Turtle is given a random colour.                     |
| svg         | p5.Element or p5.image | Stores the SVG of the Turtle. It is a p5 component and can store both SVG and image(png). |
| isMoving    | boolean                | Stores whether the Turtle is moving or not. True is moving; false is not moving.          |

Each parameter has its getter and setter to maintain encapsulation. Other functions to help turtles move are as follows. The parameters of the constructor:

```
constructor(id: number, initalX: number, initialY: number, initialAngle: number) {

    }
```

| Function              | returns | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `display(sketch: p5)` | void    | Draws the shape of the Turtle used in the artBoard. Drawn with the help of p5.beginShape() and p5.endShape(). The width and height parameters are used to scale the Turtle. For more info on beginShape() and endShape() see [p5.js](https://p5js.org/reference/#/p5/beginShape).                                                                                                                                                                          |
| `move(sketch: p5)`    | void    | Translate the Turtle of the left and right by the turtleX and turtleY values respectively, this is done so that when rotate is called, the Turtle rotates on its centre. It also calls p5 rotate function to rotate the Turtle. To understand translate and rotate, refer to [Video by The Coding Train](https://www.youtube.com/watch?v=o9sgjuh-CBM&ab_channel=TheCodingTrain)                                                                               |
| `render(sketch:p5)`   | void    | Apply color to the Turtle and calls the display and move function. All these are wrapped inside p5 push() and pop() functions.<br /> The push() function is used to store the current state of the Turtle and pop() function is used to restore the state. This ensures that translate and move is not applied to all the turtles and each turtles behave differently. For more info on push() and pop() see [p5.js](https://p5js.org/reference/#/p5/push). |
| `callSVG(sketch:p5)`  | void    | Calls the svg of the turtle using p5 loadImage() function and stores it in the svg variable.                                                                                                                                                                                                                                                                                                                                                                |

## ArtBoardDraw.ts

## ArtBoardManager.ts

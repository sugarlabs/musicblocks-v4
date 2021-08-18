# ArtBoard Model

ArtBoard Model is responsible for storing the structure of the class and its parameter used for artBoardDraw funtionality.These classes are called by the `ArtBoardSketch.tsx` and `ArtBoardTurtle.tsx` There are majorly 4 different classes.

<ul>
<li> ArtBoardDraw.ts
<li> ArBoard.ts
<li> ArBoardManager.ts
<li> Turtle.ts
</ul>

---

&nbsp;

## ArBoardDraw.ts

Responsible for storing the thickness and the color of the line drawn on the artBoard. Each instance of `artBoardSketch.tsx` calls artBoardDraw constructor with color (RGB format) as the parameter.

| Parameter    | Type                   | Description                                              |
| ------------ | ---------------------- | -------------------------------------------------------- |
| StrokeWeight | number                 | Defines the thickeness of the line drawn on the artBoard |
| StrokeColor  | [number,number,number] | Defines the color of the line drawn on the artBoard      |

Both of these parameters have their own getter and setter to maintain encapsulation.

```
constructor(strokeColor : [number,number,number]){

}
```

## Turtle.ts

Responsible for creating a turtle and each turtle is identified with their own unique id. Each instance of `artBoardTurtle.tsx` calls Turtle with the id, the initial position and the initial angle of the turtle.

| Parameter   | Type                   | Description                                                                               |
| ----------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| id          | number                 | Each instance of turtle is assocciated with a unique id                                   |
| turtleX     | number                 | Stores the inital x position of the turtle                                                |
| turtleY     | number                 | Stores the intial y position of the turtle                                                |
| turtleAngle | number                 | Stores the initial angle of the turtle                                                    |
| width       | number                 | Stores the width of the drawn turtle.                                                     |
| height      | number                 | Stores the height of the drawn turtle.                                                    |
| color       | [number,number,number] | Defines the color of the turtle. Each turtle is given a random color.                     |
| svg         | p5.Element or p5.image | Stores the svg of the turtle. It is a p5 component and can store both svg and image(png). |
| isMoving    | boolean                | Stores whether the turtle is moving or not. True is moving, False is not moving.          |

Each parameter has their own getter and setter to maintain encapsulation. Other functions to help turtle move are as follows. The paramters of the constructor:

```
constructor(id: number, initalX: number, initialY: number, initialAngle: number) {

    }
```

| Function              | returns | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `display(sketch: p5)` | void    | Draws the shape of the turtle used in the artBoard. Drawn with the help of p5.beginShape() and p5.endShape(). The weidth and height parameters are used to scale the turtle. For more info on beginShape() and endShape() see [p5.js](https://p5js.org/reference/#/p5/beginShape).                                                                                                                                                                          |
| `move(sketch: p5)`    | void    | Translate the turtle of the left and right by the turtleX and turtleY values respectively, this is done so that when rotate is called the turtle rotates on its center. It also calls p5 rotate function to rotate the turtle. To understand translate and rotate refer to [Video by The Coding Train](https://www.youtube.com/watch?v=o9sgjuh-CBM&ab_channel=TheCodingTrain)                                                                               |
| `render(sketch:p5)`   | void    | Apply color to the turtle and calls the display and move function. All these are wrapped inside p5 push() and pop() functions.<br /> The push() function is used to store the current state of the turtle and pop() function is used to restore the state. This ensures that translate and move is not applied to all the turtles and each turtles behave differently. For more info on push() and pop() see [p5.js](https://p5js.org/reference/#/p5/push). |
| `callSVG(sketch:p5)`  | void    | Calls the svg of the turtle using p5 loadImage() function and stores it in the svg variable.                                                                                                                                                                                                                                                                                                                                                                |

## ArtBoardDraw.ts

## ArtBoardManager,ts

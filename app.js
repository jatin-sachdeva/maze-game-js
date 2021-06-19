// World : basically whatever is contained inside the canvas is contained under World
// Engine : keeps track of properties of stuff inside World example shape, speed,etc
// Runner : attaches a engine to the world so that Engine can track and update the changes of World
// Render : it displays and Renders the stuff onto the DOM or screen
// Bodies : has methods to create various different shapes and  objects

const { World, Runner, Engine, Render, Bodies, MouseConstraint, Mouse, Body, Events } = Matter;

// intiliasing an engine
const myEngine = Engine.create({
	gravity: {
		x: 0,
		y: 0,
		scale: 0.001
	}
});
// getting access the world created by engine, intializing engine creates a world for us
const { world: myWorld } = myEngine;
// rendering a window/canvas to the dom where the content will be displayed

const width = 600;
const height = 800;
const cells = 6;
const gameDiv = document.querySelector('#game');
console.log(gameDiv);
const myRender = Render.create({
	element: gameDiv, // specifies where the canvas will be rendered
	engine: myEngine, // which engine will be rendered
	options: {
		width,
		height
	}
});
Render.run(myRender); // renders the created render object on the screen
Runner.run(Runner.create(), myEngine); // runner will bind a runner to an engine
// World.add(
// 	myWorld
// 	// MouseConstraint.create(myEngine, {
// 	// 	mouse: Mouse.create(myRender.canvas) // adding the mouse controls
// 	})
// );
// walls
const walls = [
	Bodies.rectangle(width / 2, 0, width, 10, { isStatic: true }),
	Bodies.rectangle(width / 2, height, width, 10, { isStatic: true }),
	Bodies.rectangle(0, height / 2, 10, height, { isStatic: true }),
	Bodies.rectangle(width, height / 2, 10, height, { isStatic: true })
];
World.add(myWorld, walls);
// random Shapes
// for (let i = 0; i < 50; i++) {
// 	if (Math.random() > 0.5) {
// 		World.add(
// 			myWorld,
// 			Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50, {
// 				isStatic: false
// 			})
// 		);
// 	} else {
// 		World.add(
// 			myWorld,
// 			Bodies.circle(Math.random() * width, Math.random() * height, 30, {
// 				isStatic: false
// 			})
// 		);
// 	}
// }
// creating a new rectangle type shape from Bodies object method

// adding to my world

// logic for creating maze
//STEP1. creating a grid of size n*n , creating verticals and horizontals and storing horzintal and vertical lines of seperation
// in them.

const grid = new Array(cells).fill(null).map(() => new Array(cells).fill(false));
const verticals = new Array(cells).fill(null).map(() => new Array(cells - 1).fill(false));
const horizontals = new Array(cells - 1).fill(null).map(() => new Array(cells).fill(false));

//STEP2. selecting a random cell to start with
const initialRow = Math.floor(Math.random() * 3);
const initialCol = Math.floor(Math.random() * 3);

//utility function to shuffle the maze
const shuffle = (ar) => {
	let i = ar.length - 1;
	while (i >= 0) {
		const rand = Math.floor(Math.random() * ar.length);
		// swap rand and i index elements
		let temp = ar[i];
		ar[i] = ar[rand];
		ar[rand] = temp;
		i--;
	}
	return ar;
};

//STEP 3 generating the logic inside the function https://www.udemy.com/course/javascript-beginners-complete-tutorial/learn/lecture/17006436#content
function setupMaze(row, col) {
	// if the cell is alerady visited  return from the function
	if (grid[row][col]) {
		return;
	}

	// set the value of cell to visited(true)
	grid[row][col] = true;

	// getting the neighbours of the randomly selected cell
	let neighbours = shuffle([
		[ row - 1, col, 'top' ],
		[ row, col + 1, 'right' ],
		[ row + 1, col, 'bottom' ],
		[ row, col - 1, 'left' ]
	]);

	// looping for each neighbour and doing some calcultaion
	for (neighbour of neighbours) {
		let [ newRow, newCol, direction ] = neighbour;

		// checking if the direction is out of bounds
		if (newRow >= cells || newRow < 0 || newCol >= cells || newCol < 0) {
			continue;
		}
		// if the cell is already visited check for new direction
		if (grid[newRow][newCol] == true) {
			continue;
		}

		// now the pointer will move to any of the one neighbour ie to any of one direction
		// and for every move we will remove the lines and update the horizontals and verticals
		if (direction == 'top') {
			horizontals[row - 1][col] = true;
		} else if (direction == 'right') {
			verticals[row][col] = true;
		} else if (direction == 'bottom') {
			horizontals[row][col] = true;
		} else {
			verticals[row][col - 1] = true;
		}
		// calling the setupMaze again with uopdated cell
		setupMaze(newRow, newCol);
	}
}
setupMaze(initialRow, initialCol);

const unitLength = width / cells; // getting height and width of one cell
let mazeLineWidth = cells * 0.8;

// contructing horizontal walls

horizontals.forEach((row, rowIndex) => {
	row.forEach((noWall, colIndex) => {
		if (!noWall) {
			const wall = Bodies.rectangle(
				colIndex * unitLength + unitLength / 2,
				rowIndex * unitLength + unitLength,
				unitLength,
				mazeLineWidth,
				{
					label: 'walls',
					isStatic: true
				}
			);
			World.add(myWorld, wall);
		}
	});
});

// constructing vertical walls
verticals.forEach((row, rowIndex) => {
	row.forEach((noWall, colIndex) => {
		if (!noWall) {
			const wall = Bodies.rectangle(
				colIndex * unitLength + unitLength,
				rowIndex * unitLength + unitLength / 2,
				mazeLineWidth,
				unitLength,
				{
					label: 'walls',
					isStatic: true
				}
			);
			World.add(myWorld, wall);
		}
	});
});

// creating the target
const target = Bodies.rectangle(width - unitLength / 2, height - unitLength / 2, unitLength * 0.6, unitLength * 0.6, {
	isStatic: true,
	label: 'goal' // tlabels this rectangle body as goal
});
World.add(myWorld, target);

// creating the ball
const ball = Bodies.circle(unitLength / 2, unitLength / 2, unitLength / 4, {
	label: 'ball' // labels this circular body as ball
});
World.add(myWorld, ball);

// detecting key presses and adding velocities (with respect to the click) to the ball
document.addEventListener('keydown', (e) => {
	const { keyCode } = e;
	const { x, y } = ball.velocity; // current velocity;
	if (keyCode == 38) {
		console.log('up move');
		Body.setVelocity(ball, { x, y: y - 3 });
	}
	if (keyCode == 40) {
		console.log('down move');
		Body.setVelocity(ball, { x, y: y + 3 });
	}
	if (keyCode == 39) {
		console.log('right move');
		Body.setVelocity(ball, { x: x + 3, y });
	}
	if (keyCode == 37) {
		console.log('left move');
		Body.setVelocity(ball, { x: x - 3, y });
	}
});

//  getting the collision and  creating an win situation for it
Events.on(myEngine, 'collisionStart', (e) => {
	// the collision start event has event object that has pair array that contains info of  object collided
	const { pairs } = e;
	pairs.forEach((pair) => {
		// either this can be used:

		// if (pair.id == 'A86B87') {
		// 	console.log('win'); // every collide has a special id
		// 	document.querySelector('#win').innerText = 'Congratulations';
		// }

		// or this

		const { label: body2 } = pair.bodyA;
		const { label: body1 } = pair.bodyB;
		if (body1 == 'ball' && body2 == 'goal') {
			console.log('win'); // every collide has a special id
			document.querySelector('#win').innerText = 'Congratulations';

			// create an animation where everything falls off
			const bodies = myWorld.bodies; // select all bodies
			myWorld.gravity.y = 1; // setting the gravity to true
			bodies.forEach((body) => {
				if (body.label === 'walls') Body.setStatic(body, false);
			});
		}
	});
});

//REMEBER in matter.js the event object  is a single object used for every event so when the callback is ran
//						the event object empties itself again

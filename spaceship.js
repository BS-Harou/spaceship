var playground = {
	el: document.querySelector('.playground'),
	width: 400,
	height: 550,
	add: function (item) {
		this.el.appendChild(item.el || item);
	},
	remove: function (item) {
		return this.el.removeChild(item.el || item);
	}
};

class GameObject {
	constructor (className) {
		this.el = document.createElement('div');
		this.el.className = className;
		playground.add(this);
		this._x = 0;
		this._y = 0;
		this.width = 0;
		this.height = 0;
	}
	get x() {
		return this._x;
	}
	get y() {
		return this._y;
	}
	set x(val) {
		this.el.style.left = Math.round(val) + 'px';
		this._x = val;
	}
	set y(val) {
		this.el.style.top = Math.round(val) + 'px';
		this._y = val;
	}
}


class Spaceship extends GameObject {
	constructor() {
		super('spaceship');
		this.y = 400;
		this.width = 40;
		this.height = 49;
		this.speed = 0;
	}
}
var spaceship = new Spaceship;

// SHOTS

var shots = [];

class Shot extends GameObject {
	constructor(x, y) {
		super('shot');
		this.width = 2;
		this.height = 5;
		this.x = x - this.width / 2;
		this.y = y;
		this.speed = 4;
		this.life = 200;
	}
}

function createShot(x, y) {
	var shot = new Shot(x, y);
	shots.push(shot);
	return shot;
}

// ENEMIES
var enemies = [];

class Enemy extends GameObject {
	constructor(x, y) {
		super('enemy');
		this.width = 60;
		this.height = 40;
		this.x = x - this.width / 2;
		this.y = y;
		this.speedX = Math.random() - 0.5;
		this.speedY = -Math.random() * 0.85;
	}
}

function createEnemy(x, y) {
	var enemy = new Enemy(x, y);
	enemies.push(enemy);
	return enemy;
}

// HANDLE KEYS

class Keys {
	constructor() {
		this.keys = {};
		document.addEventListener('keydown', this.handleKeyDown.bind(this));
		document.addEventListener('keyup', this.handleKeyUp.bind(this));
		document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
	}

	handleKeyDown(e) {
		this.keys[e.keyCode] = true;
	}

	handleKeyUp(e) {
		delete this.keys[e.keyCode];
	}

	handleVisibilityChange(e) {
		this.key = {};
	}

	keyDown(keyCode) {
		return this.keys[keyCode];
	}

	moveUp(keyCode) {
		delete this.keys[keyCode];
	}
};
Keys.LEFT = 65;
Keys.RIGHT = 68;
Keys.SPACE = 32;
var keys = new Keys;


// ANIMATION FRAME

function handleFrame() {
	handleKeys();
	requestAnimationFrame(handleFrame);

	moveSpaceship();
	moveShots();
	moveEnemies();
	enemyShotHittest();
	randomEnemyGenerator();
}
requestAnimationFrame(handleFrame);

function moveShots() {
	for (var i=0; i<shots.length; i++) {
		var shot = shots[i];
		shot.y -= shot.speed;
		shot.life--;
		if (shot.life < 0) {
			shots.splice(i, 1);
			playground.remove(shot);
			i--;
		}
	}
}

function moveEnemies() {
	for (var i=0; i<enemies.length; i++) {
		var enemy = enemies[i];
		enemy.y -= enemy.speedY;
		enemy.x += enemy.speedX;

		if (enemy.x < 0) {
			enemy.speedX = Math.abs(enemy.speedX);
		} else if (enemy.x > playground.width - enemy.width) {
			enemy.speedX = -Math.abs(enemy.speedX);
		}

		if (enemy.y + enemy.height > playground.height) {
			alert('GAME OVER');
			location.reload();
			break;
		}
	}
}

function enemyShotHittest() {
	en: for (var i=0; i<enemies.length; i++) {
		var enemy = enemies[i];
		for (var n=0; n<shots.length; n++) {
			var shot = shots[n];
			if (shot.x > enemy.x && shot.x < enemy.x + enemy.width) {
				if (shot.y > enemy.y && shot.y < enemy.y + enemy.height) {
					enemies.splice(i, 1);
					playground.remove(enemy);

					shots.splice(n, 1);
					playground.remove(shot);
					continue en;
				}
			}
		}
	}
}

function randomEnemyGenerator() {
	if (enemies.length < 10 && Math.random() < 0.04) {
		createEnemy(Math.random() * (playground.width - 60), 50);
	}
}

function moveSpaceship() {
	spaceship.y = 500;
	spaceship.x += spaceship.speed;
	spaceship.speed *= 0.96;

	if (spaceship.x < 0) {
		spaceship.x = 0;
		spaceship.speed = 0;
	} else if (spaceship.x + spaceship.width > playground.width) {
		spaceship.x = playground.width - spaceship.width;
		spaceship.speed = 0;
	}
}

function handleKeys() {
	if (keys.keyDown(Keys.LEFT)) {
		spaceship.speed -= 0.3;
	} else if (keys.keyDown(Keys.RIGHT)) {
		spaceship.speed += 0.3;
	}

	if (keys.keyDown(Keys.SPACE)) {
		createShot(spaceship.x + spaceship.width / 2, spaceship.y);
		keys.moveUp(Keys.SPACE);
	}
}
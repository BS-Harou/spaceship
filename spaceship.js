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
		this._width = 0;
		this._height = 0;
		this._rot = 0;
	}
	get x() {
		return this._x;
	}
	get y() {
		return this._y;
	}
	get width() {
		return this._width;
	}
	get height() {
		return this._height;
	}
	get rot() {
		return this._rot;
	}
	set x(val) {
		this.el.style.left = Math.round(val) + 'px';
		this._x = val;
	}
	set y(val) {
		this.el.style.top = Math.round(val) + 'px';
		this._y = val;
	}
	set width(val) {
		this.el.style.width = Math.round(val) + 'px';
		this._width = val;
	}
	set height(val) {
		this.el.style.height = Math.round(val) + 'px';
		this._height = val;
	}
	set rot(val) {
		this.el.style.transform = 'rotate(' + Math.round(val) + 'deg)';
		this._rot = val;
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

// COUNTER
var counter = document.querySelector('.counter');
var kills = 0;
var gameover = false;
var baseFPS = 16;

// GAME TIME
var gameTime = {
	start: Date.now(),
	getTime: function() {
		return Math.min(Date.now() - this.start);
	}
};

// SHOTS

var shots = [];
var powerUp = 0;
var currentPower = document.querySelector('.current-power');

class Shot extends GameObject {
	constructor(x, y, rot=0) {
		super('shot');
		this.width = 2;
		this.height = 5;
		this.x = x - this.width / 2;
		this.y = y;
		this.rot = rot;
		this.speed = 4;
		this.life = 200;
	}
}

class Laser extends GameObject {
	constructor(x, y) {
		super('laser');
		this.width = 6;
		this.height = 10;
		this.x = x - this.width / 2;
		this.y = y - this.height;
		this.speed = 10;
		this.life = 60;
	}
}

function createShot(x, y, rot) {
	var shot = new Shot(x, y, rot);
	shots.push(shot);
	return shot;
}

var lasers = [];
function createLaser(x, y) {
	var laser = new Laser(x, y);
	lasers.push(laser);
	return laser;
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
		var speedUp = Math.min(kills / 300, 2);
		this.speedY = -Math.random() * 0.85 - (speedUp * 2);
	}
}

function createEnemy(x, y) {
	var enemy = new Enemy(x, y);
	enemies.push(enemy);
	return enemy;
}

// HANDLE KEYS

const SHOTPOWER = 8;
const MULTISHOTPOWER = 40;
const MEGAMULTISHOTPOWER = 70;
const LASERPOWER = 100;

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
		if (e.keyCode == Keys.SPACE) {
			if (powerUp < SHOTPOWER) {
				// do nothing
			} else if (powerUp < MULTISHOTPOWER) {
				createShot(spaceship.x + spaceship.width / 2, spaceship.y, 0);
			} else if (powerUp < MEGAMULTISHOTPOWER) {
				createShot(spaceship.x + spaceship.width / 2, spaceship.y, -15);
				createShot(spaceship.x + spaceship.width / 2, spaceship.y, 0);
				createShot(spaceship.x + spaceship.width / 2, spaceship.y, 15);
			} else  if (powerUp < LASERPOWER) {
				for (var i=-20; i<=20; i += 4) {
					createShot(spaceship.x + spaceship.width / 2, spaceship.y, i);
				}
			} else {
				createLaser(spaceship.x + spaceship.width / 2, spaceship.y);
			}

			powerUp = 0;
		}
		if (e.keyCode == Keys.PLUS) {
			baseFPS++;
		}
		if (e.keyCode == Keys.MINUS) {
			baseFPS = Math.max(baseFPS - 1, 1);
		}
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
Keys.LEFT = 37;
Keys.RIGHT = 39;
Keys.A = 65;
Keys.D = 68;
Keys.SPACE = 32;
Keys.PLUS = 107;
Keys.MINUS = 109;
var keys = new Keys;


// ANIMATION FRAME

var lastTime = 0;
var delta = 0;
function handleFrame(time) {
	delta = time - lastTime;
	if (delta > 1000) delta = baseFPS;
	lastTime = time;

	if (gameover) {
		alert('GAME OVER. SCORE: ' + kills);
		location.reload();
		return;
	}

	handleKeys();
	moveSpaceship();
	moveShots();
	moveLasers();
	moveEnemies();
	enemyShotHittest();
	enemyLaserHittest();
	updateCurrentPower();
	randomEnemyGenerator();
	requestAnimationFrame(handleFrame);
}
requestAnimationFrame(handleFrame);

function deltaSpeed(speed) {
	return speed / baseFPS * delta;
}

function moveShots() {
	for (var i=0; i<shots.length; i++) {
		var item = shots[i];
		item.x += Math.sin(item.rot * (Math.PI/180)) * deltaSpeed(item.speed);
		item.y -= Math.cos(item.rot * (Math.PI/180)) * deltaSpeed(item.speed);
		item.life -= deltaSpeed(1);
		if (item.life < 0) {
			shots.splice(i, 1);
			playground.remove(item);
			i--;
		}
	}
}

function updateCurrentPower() {
	currentPower.style.height = Math.round(powerUp) + '%';
	if (powerUp >= LASERPOWER) {
		currentPower.style.background = 'blue';
	} else if (powerUp > MEGAMULTISHOTPOWER) {
		currentPower.style.background = 'red';
	} else if (powerUp > MULTISHOTPOWER) {
		currentPower.style.background = 'yellow';
	} else if (powerUp > SHOTPOWER) {
		currentPower.style.background = 'green';
	} else {
		currentPower.style.background = 'gray';
	}

}

function moveLasers() {
	for (var i=0; i<lasers.length; i++) {
		var item = lasers[i];
		item.y -= deltaSpeed(item.speed);
		item.height += deltaSpeed(item.speed);
		item.x = spaceship.x + spaceship.width / 2 - item.width / 2;
		item.life -= deltaSpeed(1);
		if (item.life < 0) {
			lasers.splice(i, 1);
			playground.remove(item);
			i--;
		}
	}
}

function moveEnemies() {
	for (var i=0; i<enemies.length; i++) {
		var enemy = enemies[i];
		enemy.y -= deltaSpeed(enemy.speedY);
		enemy.x += deltaSpeed(enemy.speedX);

		if (enemy.x < 0) {
			enemy.speedX = Math.abs(enemy.speedX);
		} else if (enemy.x > playground.width - enemy.width) {
			enemy.speedX = -Math.abs(enemy.speedX);
		}

		if (enemy.y + enemy.height > playground.height) {
			gameover = true;
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
					updateKills();
					continue en;
				}
			}
		}
	}
}

function lineRectHittest(x1, y1, x2, y2, minX, minY, maxX, maxY) {
    if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY))
        return false;

    var m = (y2 - y1) / (x2 - x1);

    var y = m * (minX - x1) + y1;
    if (y > minY && y < maxY) return true;

    y = m * (maxX - x1) + y1;
    if (y > minY && y < maxY) return true;

    var x = (minY - y1) / m + x1;
    if (x > minX && x < maxX) return true;

    x = (maxY - y1) / m + x1;
    if (x > minX && x < maxX) return true;

    return false;
}

function enemyLaserHittest() {
	en: for (var i=0; i<enemies.length; i++) {
		var enemy = enemies[i];
		for (var n=0; n<lasers.length; n++) {
			var laser = lasers[n];
			var x1 = laser.x + laser.width / 2;
			var y1 = laser.y;
			var x2 = x1;
			var y2 = laser.y + laser.height;
			var minX = enemy.x
			var minY = enemy.y;
			var maxX = enemy.x + enemy.width;
			var maxY = enemy.y + enemy.height;
			var hit = lineRectHittest(x1, y1, x2, y2, minX, minY, maxX, maxY);
			if (hit) {
				enemies.splice(i, 1);
				playground.remove(enemy);
				updateKills();
				continue en;
			}
		}
	}
}

function updateKills() {
	kills++;
	counter.innerHTML = 'Killed: ' + kills;
}

function randomEnemyGenerator() {
	maxEnemies = 10 + Math.round(kills / 20);
	if (enemies.length < maxEnemies && Math.random() < deltaSpeed(0.05)) {
		createEnemy(Math.random() * (playground.width - 60), -20);
	}
}

function moveSpaceship() {
	spaceship.y = 500;
	spaceship.x += deltaSpeed(spaceship.speed);
	if (spaceship.speed != 0) {
		var diff = deltaSpeed(spaceship.speed - spaceship.speed * 0.96);
		spaceship.speed -= diff;
		if (Math.abs(spaceship.speed) < 0.01) {
			spaceship.speed = 0;
		}
	}

	if (spaceship.x < 0) {
		spaceship.x = 0;
		spaceship.speed = 0;
	} else if (spaceship.x + spaceship.width > playground.width) {
		spaceship.x = playground.width - spaceship.width;
		spaceship.speed = 0;
	}
}

function handleKeys() {
	if (keys.keyDown(Keys.LEFT) || keys.keyDown(Keys.A)) {
		spaceship.speed -= deltaSpeed(0.3);
	} else if (keys.keyDown(Keys.RIGHT) || keys.keyDown(Keys.D)) {
		spaceship.speed += deltaSpeed(0.3);
	}

	if (keys.keyDown(Keys.SPACE) && !lasers.length) {
		powerUp = Math.min(powerUp + deltaSpeed(1), 100);
	}
}
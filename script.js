window.onload = function(){
    game = new Game();
    game.init();
    game.update();
}

function Game() {

    fontSize = 32;
    font = "Georgia";

    playerSize = 50;
    playerSpeed = 10;
    playerHealth = 10;

    crossRadius = 5;

    gameStart = null;
    gameOver = null;
    startedPlaying = false;

    canvas = null;
    ctx = null;

    player = null;
    cross = null;
    enemySpawner = null;
    healthPackSpawner = null;
    bulletCollider = null;
    enemyCollider = null;
    score = null;

    mouseX = null;
    mouseY = null;

    this.init = function(){

        window.addEventListener("mousemove", function(event){
            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        gameOver = false;

        canvas = document.getElementById("gameCanvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx = canvas.getContext("2d");

        laserSound = document.getElementById('laserShoot');
        enemyDeath = document.getElementById('enemyDeath');
        playerDeath = document.getElementById('playerDeath');
        healthPick = document.getElementById('healthPick');
        dnbMusic = document.getElementById('dnbMusic');

        player = new Player(canvas.width / 2 - playerSize / 2, canvas.height / 2 - playerSize / 2, playerSize, playerSpeed, playerHealth, ctx);
        cross = new Cross(ctx, crossRadius);
        score = new Score(ctx);

        healthRenderer = new HealthRenderer(player, ctx);
        healthPackSpawner = new HealthPackSpawner(ctx);
        healthCollider = new HealthCollider(player, healthPackSpawner);

        enemySpawner = new EnemySpawner(player, score, ctx);
        enemyCollider = new EnemyCollider(player, enemySpawner);
        bulletCollider = new BulletCollider(player, enemySpawner);

        // if(!startedPlaying){
        //     dnbMusic.loop = true;
        //     dnbMusic.play();
        //     startedPlaying = true;
        // }
    }

    this.shouldUpdate = function(){
        return player.getHealth() > 0;
    }

    this.setGameOverState = function(){
        this.showGameOverScreen();
        gameOver = true;

        window.addEventListener('keypress', (event) => {
            key = event.which || event.keyCode;
            if(key == 13 && gameOver){
                this.init();
            }
        });
    }

    this.setGameStartState = function(){
        this.showGameStartScreen();
        
        window.addEventListener('keypress', (event) => {
            key = event.which || event.keyCode;
            if(key == 13 && !gameStart){
                gameStart = true;
            }
        });
    }

    this.showGameStartScreen = function(){
        infoString = 'Defend yourself against the';
        zombiesString = ' zombies.';
        controlString = 'Use W,A,S,D or Arrow Keys to move, SPACE or Left Mouse Click to fire.';
        promptString = 'Press "Enter" to start.';

        ctx.font = fontSize + "px " + font;
        ctx.fillStyle = "#00ff00";
        ctx.fillText(infoString, ctx.canvas.width / 2 - infoString.length / 2 * fontSize * 0.6, ctx.canvas.height / 2 - 64);
        ctx.fillStyle = "#ff0000";
        ctx.fillText(zombiesString, ctx.canvas.width / 2 + infoString.length / 2 * fontSize * 0.3, ctx.canvas.height / 2 - 64);
        ctx.fillStyle = "#0000ff";
        ctx.fillText(controlString, ctx.canvas.width / 2 - controlString.length / 3 * fontSize * 0.7, ctx.canvas.height / 2);
        ctx.fillStyle = "#00ff00";
        ctx.fillText(promptString, ctx.canvas.width / 2 - promptString.length / 3 * fontSize * 0.6, ctx.canvas.height / 2 + 40);
    }

    this.showGameOverScreen = function(){
        gameOverString = 'Game over';
        totalScoreString = 'Total score: ' + score.getPoints();
        scoreLengthString = score.getPoints().toString();
        playAgainString = 'Press "Enter" to play again';

        ctx.font = fontSize + "px " + font;
        ctx.fillStyle = "#ff0000";
        ctx.fillText(gameOverString, ctx.canvas.width / 2 - gameOverString.length / 2 * fontSize * 0.8, ctx.canvas.height / 2 - 64);
        ctx.fillStyle = "#00ff00";
        ctx.fillText(totalScoreString, ctx.canvas.width / 2 - (gameOverString.length + scoreLengthString.length) / 2 * fontSize * 0.8, ctx.canvas.height / 2);
        ctx.fillStyle = "#0000ff";
        ctx.fillText(playAgainString, ctx.canvas.width / 2 - playAgainString.length / 3 * fontSize * 0.8, ctx.canvas.height / 2 + 40);
    }

    this.updateCtx = function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    this.updateMusic = function(){
        if(!startedPlaying){
            dnbMusic.loop = true;
            dnbMusic.play();
            startedPlaying = true;
        }
    }

    this.update = function(){
        this.updateCtx();
        if(gameStart){
            if(this.shouldUpdate()){
                this.updateEntities();
                this.updateMusic();
            }
            else this.setGameOverState();
        }
        else {
            this.setGameStartState();
        }
        
        requestAnimationFrame(() => {this.update();});
    }

    this.updateEntities = function(){
        player.move();
        player.updateBullets();
        player.updateFireStatus(mouseX, mouseY);

        enemySpawner.update();
        enemySpawner.updateEnemies();

        bulletCollider.update();
        enemyCollider.update();

        healthPackSpawner.update();
        healthCollider.update();

        cross.draw();
        player.draw(mouseX, mouseY);
        player.drawBullets();
        enemySpawner.drawEnemies();
        score.draw();
        healthRenderer.draw();
    }
}

function Cross(ctx, radius){

    this.ctx = ctx;
    this.radius = radius;

    crossX = null;
    crossY = null;

    window.addEventListener('mousemove', function(event){
        crossX = event.clientX;
        crossY = event.clientY;
    });

    this.draw = function(){

        // this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#00ff00';

        // Top line.
        this.ctx.moveTo(crossX, crossY - radius);
        this.ctx.lineTo(crossX, crossY - 3 * radius);
        this.ctx.stroke(); 

        // Bottom line.
        this.ctx.moveTo(crossX, crossY + radius);
        this.ctx.lineTo(crossX, crossY + 3 * radius);
        this.ctx.stroke();

        // Left line.
        this.ctx.moveTo(crossX - radius, crossY);
        this.ctx.lineTo(crossX - 3 * radius, crossY);
        this.ctx.stroke();

        // Right line.
        this.ctx.moveTo(crossX + radius, crossY);
        this.ctx.lineTo(crossX + 3 * radius, crossY);
        this.ctx.stroke();

        this.ctx.closePath();
        // this.ctx.restore();
    }
}

function Player(x, y, size, speed, health, ctx) {
    
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.health = health;
    this.maxHealth = health;
    this.bullets = [];
    this.ctx = ctx;
    
    playerSpeed = this.speed;
    moveLeft = false;
    moveRight = false;
    moveUp = false;
    moveDown = false;
    bulletFired = false;

    window.addEventListener('keydown', function(event){
        key = event.which || event.keyCode;
        if(key == 40 || key == 83){ // Moving down
            moveDown = true;
        }
        else if(key == 38 || key == 87){ // Moving up
            moveUp = true;
        }
        else if(key == 39 || key == 68){ // Moving right
            moveRight = true;
        }
        else if(key == 37 || key == 65){ // Moving left
            moveLeft = true;
        }
    });

    window.addEventListener('keyup',function(event){
        key = event.which || event.keyCode;
        if(key == 40 || key == 83){ // Moving down
            moveDown = false;
        }
        else if(key == 38 || key == 87){ // Moving up
            moveUp = false;
        }
        else if(key == 39 || key == 68){ // Moving right
            moveRight = false;
        }
        else if(key == 37 || key == 65){ // Moving left
            moveLeft = false;
        }
    });

    window.addEventListener('keypress', function(event){
        key = event.which || event.keyCode;
        if(key == 32 && gameStart && !gameOver){
            bulletFired = true;
            laserSound.currentTime = 0;
            laserSound.play();
        }
    });

    window.addEventListener('click', function(){
        if(gameStart && !gameOver){
            bulletFired = true;
            laserSound.currentTime = 0;
            laserSound.play();
        }
    });

    this.getX = function(){
        return this.x;
    }

    this.getY = function(){
        return this.y;
    }

    this.getSize = function(){
        return this.size;
    }

    this.getHealth = function(){
        return this.health;
    }

    this.getCenterX = function(){
        return this.getX() + this.getSize() / 2;
    }

    this.getCenterY = function(){
        return this.getY() + this.getSize() / 2;
    }

    this.getAngle = function(mouseX, mouseY){
        dx = mouseX - (this.getX() + this.getSize());
        dy = mouseY - (this.getY() + this.getSize());
        return Math.atan2(dy, dx);
    }

    this.getBullets = function(){
        return this.bullets;
    }

    this.updateFireStatus = function(mouseX, mouseY){
        if(bulletFired){
            this.addBullet(mouseX, mouseY);
            bulletFired = false;
        }
    }

    this.addBullet = function(mouseX, mouseY){
        bullet = new Bullet(this, 40, mouseX, mouseY, this.ctx);
        this.bullets.push(bullet);
    }

    this.updateBullets = function(){
        this.bullets.forEach((bullet, index) => {
            if(!bullet.isWithinBounds()){
                this.removeBullet(index);
            }
            bullet.update();
        });
    }

    this.removeBullet = function(index){
        this.bullets.splice(index, 1);
    }

    this.drawBullets = function(){
        this.bullets.forEach((elem) => elem.draw());
    }

    this.draw = function(mouseX, mouseY){

        angle = this.getAngle(mouseX, mouseY);

        this.ctx.save();
        this.ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        this.ctx.rotate(angle);
        this.ctx.translate(-this.x - this.size / 2, -this.y - this.size / 2);

        //this.ctx.beginPath();
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.rect(this.x, this.y, this.size, this.size);
        this.ctx.stroke();
        //this.ctx.closePath();
        this.ctx.restore();
    }

    this.stayWithinBounds = function(){
        if(this.x + this.size > this.ctx.canvas.width){
            this.x = this.ctx.canvas.width - this.size - 1;
        }
        if(this.x < 0){
            this.x = 1;
        }
        if(this.y + this.size > this.ctx.canvas.height){
            this.y = this.ctx.canvas.height - this.size - 1;
        }
        if(this.y < 0){
            this.y = 1;
        }
    }

    this.move = function(){
        this.stayWithinBounds();
        if(moveDown) this.moveDown();
        if(moveUp) this.moveUp();
        if(moveRight) this.moveRight();
        if(moveLeft) this.moveLeft();
    }

    this.moveDown = function(){
        this.y += this.speed;
    }

    this.moveUp = function(){
        this.y -= this.speed;
    }

    this.moveRight = function(){
        this.x += this.speed;
    }

    this.moveLeft = function(){
        this.x -= this.speed;
    }

    this.stop = function(){
        this.speed = 0;
    }

    this.loseHealth = function(damage){
        if(this.health > 0){
            this.health -= Math.min(this.health, damage);
            playerDeath.currentTime = 0;
            playerDeath.play();
        }
    }

    this.regainHealth = function(healthPoints){
        this.health = Math.min(this.maxHealth, this.health + healthPoints);
    }
}

function Bullet(player, speed, mouseX, mouseY, ctx){

    this.ctx = ctx;

    this.angle = player.getAngle(mouseX, mouseY);
    this.bulletX = player.getCenterX() + (player.getSize() * Math.cos(this.angle));
    this.bulletY = player.getCenterY() + (player.getSize() * Math.sin(this.angle));

    this.getX = function(){
        return this.bulletX;
    }

    this.getY = function(){
        return this.bulletY;
    }

    this.isWithinBounds = function(){
        return this.bulletX >= 0 && this.bulletY <= this.ctx.canvas.width && this.bulletY >= 0 && this.bulletY <= this.ctx.canvas.height;
    }
    
    this.update = function(){
        this.bulletX += speed * Math.cos(this.angle);
        this.bulletY += speed * Math.sin(this.angle);
    }

    this.draw = function(){
        //this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.rect(this.bulletX, this.bulletY, 5, 5);
        this.ctx.stroke();
        this.ctx.closePath();
        //this.ctx.restore();
    }
}

function Enemy(x, y, size, speed, health, player, ctx){
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.health = health;
    this.player = player;
    this.ctx = ctx;

    this.getX = function(){
        return this.x;
    }

    this.getY = function(){
        return this.y;
    }

    this.getSize = function(){
        return this.size;
    }

    this.getSpeed = function(){
        return this.speed;
    }

    this.getHealth = function(){
        return this.health;
    }

    this.loseHealth = function(){
        if(this.health > 0){
            this.health--;
        }
    }

    this.getPlayer = function(){
        return this.player;
    }

    this.getCtx = function(){
        return this.ctx;
    }

    this.getAngle = function(){
        dx = this.player.getX() + this.player.getSize() / 2 - (this.getX() + this.getSize());
        dy = this.player.getY() + this.player.getSize() / 2 - (this.getY() + this.getSize());
        return Math.atan2(dy, dx);
    }

    this.update = function(){
        enemyAngle = this.getAngle();
        this.x += this.speed * Math.cos(enemyAngle);
        this.y += this.speed * Math.sin(enemyAngle);
    }

    this.draw = function(){

        enemyAngle = this.getAngle();

        this.ctx.save();
        this.ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        this.ctx.rotate(enemyAngle);
        this.ctx.translate(-this.x - this.size / 2, -this.y - this.size / 2);

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.rect(this.x, this.y, this.size, this.size);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }
}

function EnemySpawner(player, score, ctx){

    this.enemies = [];
    this.player = player;
    this.score = score;
    this.ctx = ctx;
    this.enemySpawnTimeout = 0;

    totalEnemies = 10;
    timeout = 60;

    this.update = function(){
        if(this.enemySpawnTimeout >= timeout && this.enemies.length < totalEnemies){
            this.spawnEnemy();
            this.enemySpawnTimeout = 0;
        }
        this.enemySpawnTimeout++;
    }

    this.updateEnemies = function(){
        this.enemies.forEach((enemy, index) => {
            if(enemy.getHealth() <= 0){
                this.removeEnemy(index);
                this.score.update();
                enemyDeath.currentTime = 0;
                enemyDeath.play()
            }
            enemy.update();
        });
    }

    this.drawEnemies = function(){
        this.enemies.forEach((enemy, index) => {
            enemy.draw();
        });
    }

    this.getEnemy = function(index){
        return this.enemies[index];
    }

    this.spawnEnemy = function(){

        side = Math.floor(Math.random() * 100);

        enemyX = 0;
        enemyY = 0;
        
        if(side <= 25) {
            enemyX = -50;
            enemyY = 50 + Math.random() * (this.ctx.canvas.height - 50);
        }
        else if(side > 25 && side <= 50){
            enemyX = 50 + Math.random() * (this.ctx.canvas.width - 50);
            enemyY = -50;
        }
        else if(side > 50 && side <= 75){
            enemyX = this.ctx.canvas.width + 50;
            enemyY = 50 + Math.random() * (this.ctx.canvas.height - 50);
        }
        else {
            enemyX = 50 + Math.random() * (this.ctx.canvas.width - 50);
            enemyY = this.ctx.canvas.height + 50;
        }
        enemySize = 0;
        enemySpeed = 0;
        enemyHealth = 0;

        randomSize = Math.random();

        if(randomSize <= 0.3){
            enemySize = 30;
            enemySpeed = 7;
            enemyHealth = 1;
        }
        else if(randomSize <= 0.7){
            enemySize = 50;
            enemySpeed = 5;
            enemyHealth = 2;
        }
        else {
            enemySize = 80;
            enemySpeed = 3;
            enemyHealth = 3;
        }

        enemy = new Enemy(enemyX, enemyY, enemySize, enemySpeed, enemyHealth, this.player, this.ctx);
        this.enemies.push(enemy);
    }

    this.removeEnemy = function(index){
        this.enemies.splice(index, 1);
    }

    this.getEnemies = function(){
        return this.enemies;
    }
}

function BulletCollider(player, enemySpawner){

    this.player = player;
    this.enemySpawner = enemySpawner;

    this.update = function(){
        bullets = this.player.getBullets();
        enemies = this.enemySpawner.getEnemies();

        bullets.forEach((bullet, bulletIndex) => {
            enemies.forEach((enemy, enemyIndex) => {
                if(this.collide(bullet, enemy)){
                    this.player.removeBullet(bulletIndex);
                    enemy.loseHealth();
                }
            });
        });
    }

    this.collide = function(bullet, enemy){

        bulletX = bullet.getX();
        bulletY = bullet.getY();

        enemyX = enemy.getX();
        enemyY = enemy.getY();
        enemySize = enemy.getSize();

        horizontalCollision = (bulletX > enemyX) && (bulletX < enemyX + enemySize);
        verticalCollision = (bulletY > enemyY) && (bulletY < enemyY + enemySize);

        return horizontalCollision && verticalCollision;
    }
}

function EnemyCollider(player, enemySpawner) {

    this.player = player;
    this.enemySpawner = enemySpawner;

    this.update = function(){
        enemies = this.enemySpawner.getEnemies();
        enemies.forEach((enemy, index) => {
            if(this.collide(enemy)){
                enemySize = enemy.getSize();
                if(enemySize == 30){
                    this.player.loseHealth(1);
                }
                else if(enemySize == 50){
                    this.player.loseHealth(2);
                }
                else{
                    this.player.loseHealth(3);
                }
                this.enemySpawner.removeEnemy(index);
            }
        });
    }

    this.collide = function(enemy){

        playerSize = this.player.getSize();
        playerX = this.player.getX() + playerSize;
        playerY = this.player.getY() + playerSize;

        enemySize = enemy.getSize();
        enemyX = enemy.getX() + enemySize;
        enemyY = enemy.getY() + enemySize;

        distance = Math.sqrt(Math.pow(playerX - enemyX, 2) + Math.pow(playerY - enemyY, 2));

        return distance < (playerSize / 2) + (enemySize / 2);
    }
}

function Score(ctx){

    this.ctx = ctx;
    this.points = 0;
    this.scoreIncrement = 10;
    this.literal = "SCORE: ";
    this.fontSize = 20;
    this.font = "Georgia";

    this.update = function(){
        this.points += this.scoreIncrement;
    }

    this.getPoints = function(){
        return this.points;
    }

    this.draw = function(){
        this.ctx.font = this.fontSize + "px " + this.font;
        this.ctx.fillStyle = "#00ff00";
        this.ctx.fillText(this.literal + this.points, this.ctx.canvas.width / 2 - this.literal.length * this.fontSize, this.fontSize);
    }

}

function HealthRenderer(player, ctx){

    this.player = player;
    this.ctx = ctx;

    this.literal = "HEALTH: ";
    this.fontSize = 20;
    this.font = "Georgia";

    this.squareSize = 10;

    this.draw = function(){
        health = this.player.getHealth();
        this.ctx.font = this.fontSize + "px " + this.font;
        this.ctx.fillStyle = "#0000ff";
        this.ctx.strokeStyle = "#0000ff";
        this.ctx.beginPath();
        this.ctx.fillText(this.literal, this.ctx.canvas.width - this.squareSize * 10 - this.literal.length * this.fontSize, this.fontSize);
        this.ctx.fillRect(this.ctx.canvas.width - this.squareSize * 10 - this.fontSize * 3, 3, health * this.squareSize, this.fontSize);
        this.ctx.rect(this.ctx.canvas.width - this.squareSize * 10 - this.fontSize * 3, 3, 10 * this.squareSize, this.fontSize);
        this.ctx.stroke();
        this.ctx.closePath();
    }
}

function HealthPack(size,healthPoints,ctx){

    this.size = size;
    this.healthPoints = healthPoints;
    this.ctx = ctx;

    this.x = Math.max(this.size, Math.random() * (this.ctx.canvas.width - this.size));
    this.y = Math.max(this.size, Math.random() * (this.ctx.canvas.height - this.size));

    this.getX = function(){
        return this.x;
    }

    this.getY = function(){
        return this.y;
    }

    this.getSize = function(){
        return this.size;
    }

    this.getHealthPoints = function(){
        return this.healthPoints;
    }

    this.draw = function(){
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#0000ff";
        this.ctx.rect(this.x, this.y, this.size, this.size);
        this.ctx.stroke();
        this.ctx.closePath();
    }
}

function HealthPackSpawner(ctx){

    healthInterval = 900;
    activeInterval = 180;
    
    this.ctx = ctx;

    this.interval = 0;
    this.activeInterval = 0;
    this.healthActive = false;

    this.healthPack = null;

    this.getHealthPack = function(){
        return this.healthPack;
    }

    this.destroyHealthPack = function(){
        this.healthPack = null;
    }

    this.reset = function(){
        this.interval = 0;
        this.activeInterval = 0;
        this.healthActive = false;
        this.healthPack = null;
    }

    this.update = function(){
        if(this.interval >= healthInterval && !this.healthActive){
            this.healthActive = true;
            this.activeInterval = 0;
            healthPoints = 1 + Math.floor(Math.random() * 10);
            this.healthPack = new HealthPack(50, healthPoints, this.ctx);
        }
        if(this.healthActive){
            if(this.activeInterval <= activeInterval){
                this.healthPack.draw();
                this.activeInterval++;
            }
            else{
                this.healthActive = false;
                this.interval = 0;
                this.healthPack = null;
            }
        }
        this.interval++;
    }
}

function HealthCollider(player,healthPackSpawner){

    this.player = player;
    this.healthPackSpawner = healthPackSpawner;

    this.update = function(){
        if(this.collide()){
            randomHealth = this.getRandomHealth();
            this.player.regainHealth(randomHealth);
            this.healthPackSpawner.reset();
            healthPick.currentTime = 0;
            healthPick.play();
        }
    }

    this.collide = function(){

        playerX = this.player.getX();
        playerY = this.player.getY();
        playerSize = this.player.getSize();

        healthPack = this.healthPackSpawner.getHealthPack();

        if(healthPack != null){

            healthPackX = healthPack.getX();
            healthPackY = healthPack.getY();
            healthPackSize = healthPack.getSize();

            distance = Math.sqrt(Math.pow(playerX - healthPackX, 2) + Math.pow(playerY - healthPackY, 2));
    
            return distance < (playerSize / 1.5) + (healthPackSize / 1.5);
        }
        else return false;
    }

    this.getRandomHealth = function(){
        var factor = Math.random();
        if(factor <= 0.3){
            return 2;
        }
        else if(factor <= 0.6){
            return 3;
        }
        else return 4;
    }
}
// selecting canvas
const canvas = document.querySelector("canvas");
const scoreNum = document.querySelector("#scoreNum");
const containerDiv = document.getElementById("containerDiv")
const startBtn = document.getElementById("startBtn")
const finalScore = document.getElementById("finalScore")
let score = 0;
let delay = 2000;

// creating simple canvas with 2d context
const context = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

// find the center of the canvas
const cenWidth = canvas.width / 2
const cenHeight = canvas.height / 2

// Player class to create player on the screen
class Player {
    constructor(width, height, radius, color){
        this.x = width,
        this.y = height,
        this.r = radius,
        this.c = color
    }
    draw (){
        context.beginPath()
        context.arc(this.x, this.y, this.r, 0, Math.PI * 2, false)
        context.fillStyle = this.c
        context.fill()
    }
}

// create simple projectiles
class Projectile {
    constructor(width, height, radius, color, velocity){
        this.x = width,
        this.y = height,
        this.r = radius,
        this.c = color
        this.v = velocity
    }
    draw (){
        context.beginPath()
        context.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        context.fillStyle = this.c;
        context.fill();
    }
    update(){
        this.x = this.x + this.v.x
        this.y = this.y + this.v.y
        this.draw();
    }
}

// enemy class
class Enemy {
    constructor(width, height, radius, color, velocity){
        this.x = width,
        this.y = height,
        this.r = radius,
        this.c = color
        this.v = velocity
    }
    draw (){
        context.beginPath()
        context.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        context.fillStyle = this.c;
        context.fill();
    }
    update(){
        this.x = this.x + this.v.x
        this.y = this.y + this.v.y
        this.draw();
    }
}

const friction = 0.99
class Particle {
    constructor(width, height, radius, color, velocity){
        this.x = width,
        this.y = height,
        this.r = radius,
        this.c = color
        this.v = velocity
        this.alpha = 1
    }
    draw (){
        context.save()
        context.globalAlpha = this.alpha
        context.beginPath()
        context.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        context.fillStyle = this.c;
        context.fill();
        context.restore();
    }
    update(){
        this.x = this.x + this.v.x
        this.y = this.y + this.v.y
        this.v.x *= friction
        this.v.y *= friction
        this.draw();
        this.alpha -= 0.01
    }
}

// array to store projectiles data
let projectiles = []
let enemies = []
let particles = []

// creating & drawing player
let player = new Player(cenWidth, cenHeight, 25, "white");
player.draw();

const init = () => {
    projectiles = []
    enemies = []
    particles = []
    player = new Player(cenWidth, cenHeight, 25, "white");
    score = 0
    delay = 2000
    scoreNum.innerHTML = 0
    finalScore.innerHTML = 0

}

// function to spawn enemies
let boost = 1;
const spawnEnemy = () => {
    setInterval( () => {
        const radius = Math.floor(Math.random() * 40) + 10;
        let x, y;
        if(Math.random() < 0.5){
            y = Math.random() * canvas.height
            x = Math.random() < 0.5 ? 0 - radius : radius + canvas.width
        } else {
            y = Math.random() < 0.5 ? 0 - radius : radius + canvas.height
            x = Math.random() * canvas.width
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2( canvas.height / 2 - y, canvas.width / 2 - x);
        const velocity = { x: Math.cos(angle) * boost , y: Math.sin(angle) * boost};
        enemies.push(new Enemy( x, y , radius, color, velocity))
    }, delay)
}

// to store temporary score
// animate projectiles on the screen
function animate(){
    const animationId = requestAnimationFrame(animate);
    // clearing screen
    context.fillStyle = "rgb(0, 0, 0, 0.1)"
    context.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    // drawing explosion particles
    particles.forEach((particle, pindex) => {
     if(particle.alpha <= 0){
         particles.splice(pindex, 1)
     } else {
        particle.update()
      }
    })
    // drawing and remove projectiles from the screen
    projectiles.forEach((projectile) => {
        projectile.update()
        if(projectile.x + projectile.r < 0 || projectile.x - projectile.r > canvas.width ||
            projectile.y + projectile.r < 0 || projectile.y - projectile.r > canvas.height){
            setTimeout((projectile, pindex) => {
                projectiles.splice(pindex, 1)
            }, 0)
        }
    });
    // drawing enemies and handling collision between enemy, projectile and player
    enemies.forEach((enemy, eindex) => {
        enemy.update()
        projectiles.forEach((projectile, pindex) => {
            // detect enemy and projectile collision
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if(dist - enemy.r - projectile.r < 1){
                for(let i = 0; i < enemy.r; i++){
                    particles.push(new Particle(projectile.x, projectile.y, Math.floor(Math.random() * 4 + 1), enemy.c,  { x:(Math.random() - 0.5) * (Math.random() * 8), y:(Math.random() - 0.5) * (Math.random() * 8) }))
                }
                if(enemy.r - 10  > 10){
                    score += 10
                    scoreNum.innerHTML = score
                    gsap.to(enemy, { r: enemy.r - 9})
                    setTimeout(() => { projectiles.splice(pindex, 1); }, 0)
                } else {
                    score += 25
                    scoreNum.innerHTML = score
                    setTimeout(() => {
                        enemies.splice(eindex, 1)
                        projectiles.splice(pindex, 1);
                    }, 0)
                }
            }
        });
        // detect enemy and player collision
        const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y)
        if(dist - enemy.r - player.r < 1){
            cancelAnimationFrame(animationId);
            containerDiv.style.display = "flex"
            finalScore.innerHTML = score
        }
    });
}

// on click draw projectiles
addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    const velocity = { x: Math.cos(angle) * 5, y: Math.sin(angle) * 5};
    const projectile = new Projectile(cenWidth, cenHeight, 5, 'white', velocity)
    projectiles.push(projectile);
})
// animate funtion to update stuff on the screen
startBtn.addEventListener("click", () => {
    init()
    spawnEnemy();
    animate();
    containerDiv.style.display = "none"
})


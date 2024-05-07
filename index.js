// // testing
// console.log("This is my game");

// resize canvas to be larger
const canvas = document.getElementById("game-container");
// giant object resposible for drawing out everything in the game
const c = canvas.getContext('2d')

canvas.width = 1024;
canvas.height = 576;
// console.log(c);

// function for gsap battle activation transition animation
function activateBattle () {
    gsap.to('#battle-activate', {
        opacity: 1,
        repeat: 3,
        duration: 0.4,
        yoyo: true
    })
}

// draw a rectangle to house game map
c.fillStyle = 'white';
c.fillRect(0,0, canvas.width, canvas.height);

// determine collision points based on map json data from collisions.js
// use for loop to iterate through and slice into sections of 62 (width of map) each
// create variable to hold collisions data
const collisionsMap = []
for (let i = 0; i < collisions.length; i += 62) {
    collisionsMap.push(collisions.slice(i, 62 + i))
    console.log(collisionsMap)
}

// declare boundaries array
const boundaries = []
// give offset a variable since used multiple times
const offset = {
    x: -690,
    y: -380
}

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, n) => {
        if (symbol === 1089){
            boundaries.push(
                new Boundary({
                    position: {
                        x: n * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                }
            })
        )}
    })
})

console.log(boundaries)

// battlezones data map
const battleZonesMap = []
for (let i =0; i < battleZonesData.length; i += 62){
    battleZonesMap.push(battleZonesData.slice(i, 62 + i))
    console.log(battleZonesMap)
} 

const battleZones = []

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, n) => {
        if(symbol === 1089){
            battleZones.push(
                new Boundary({
                    position: {
                        x: n * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})

// import map image
const image = new Image();
image.src = '/RPGGameMapAlyssaVille_noSprites.png'

// foreground objects image
const foregroundImage = new Image();
foregroundImage.src = '/Foreground Objects.png'

// import player down image
const playerDownImage = new Image();
playerDownImage.src = "/playerDown.png"

// player up image
const playerUpImage = new Image();
playerUpImage.src = '/playerUp.png'

// player right image
const playerRightImage = new Image();
playerRightImage.src = '/playerRight.png'

// player left image
const playerLeftImage = new Image();
playerLeftImage.src = '/playerLeft.png'

// place character in exact center of canvas
const player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 4 / 2,
        // had to adjust height to 88 px lower than sprite size (68px high) due to collision detection
        y: canvas.height / 2 + 20 / 2
    },
    image: playerDownImage,
    frames: {
        max: 4
    },
    sprites: {
        up: playerUpImage,
        down: playerDownImage,
        right: playerRightImage,
        left: playerLeftImage
    }
})


const background = new Sprite({
    // set position to an object with x and y axis
    position: {
    x: offset.x,
    y: offset.y
    },
    image: image,
})

const foreground = new Sprite({
    // set position to an object with x and y axis
    position: {
    x: offset.x,
    y: offset.y
    },
    image: foregroundImage,
})

// create an object for keys that are not pressed down by default
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

// // test
// const testBoundary = new Boundary({
//     position: {
//         x: 400,
//         y: 200
//     }
// })

// moveables
// need spread operator for array
const moveables = [background, ...boundaries, foreground, ...battleZones]

// create function to house collision detection code
function collisionDetect({ rect1, rect2 }) {
    return(
        rect1.position.x + rect1.width >= rect2.position.x && 
        rect1.position.x <= rect2.position.x + rect2.width &&
        rect1.position.y <= rect2.position.y + rect2.height &&
        rect1.position.y + rect1.height >= rect2.position.y
    )
}

// battle object with intitiated property as false
const battle = {
    initiated: false
}

// animation infinite loop
function animate() {

    window.requestAnimationFrame(animate)
    
    // load map before player so that player is on top of map
    background.draw(image)
    // draw boundaries on top of background, but before player
    boundaries.forEach(boundary => {
        boundary.draw() 
        
        if (collisionDetect({
            rect1: player,
            rect2: boundary
            })) {
                console.log("colliding")
            }
        })
    // testBoundary.draw()

    // battlezones
    battleZones.forEach(battleZone => {
        battleZone.draw()
    })

    player.draw(image)
    // draw foreground last to allow player to move behind foreground objects
    foreground.draw(image)

    //
    let moving = true
    player.walk = false

    // make sure another battle wont activate during original battle
    if (battle.initiated) return

    // battleZones code
    if(keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed){
        // battlezones collision detecting
        for (let i = 0; i < battleZones.length; i++){
            const battleZone = battleZones[i] 

            // equation to determine overlapping area between battleZone and character
            const overlappingArea = (Math.min(player.position.x + player.width, 
                battleZone.position.x + battleZone.width) - Math.max(player.position.x, 
                battleZone.position.x)) * (Math.min(player.position.y + player.height, 
                battleZone.position.y + battleZone.height) - Math.max(player.position.y, 
                battleZone.position.y))

            if (collisionDetect({
             rect1: player,
             rect2: battleZone
            }) 
            && overlappingArea > player.width * player.height / 2 && Math.random() < 0.05
        ){
                 console.log("battleZone collision")
                 battle.initiated = true
                 activateBattle()
                 break
             }
         }

    }
    // code for movement
    if (keys.w.pressed && lastKey === 'w'){
        player.walk = true
        player.image = player.sprites.up

        // create a clone of boundary and add 3 to y-axis 
        // stop character from moving up when 'w' is pressed
        for (let i = 0; i < boundaries.length; i++){
           const boundary = boundaries[i] 
           if (collisionDetect({
            rect1: player,
            rect2: {...boundary, position: {
                x: boundary.position.x,
                y: boundary.position.y +3
            } }
            })) {
                console.log("colliding")
                moving = false
                break
            }
        }
        if (moving)
        moveables.forEach((moveable) => {
            moveable.position.y +=3
        })
    }
    else if (keys.a.pressed && lastKey === 'a') {
        player.walk = true
        player.image = player.sprites.left
        // create a clone of boundary and add 3 to x-axis 
        // stop character from moving left when 'a' is pressed
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i] 
            if (collisionDetect({
             rect1: player,
             rect2: {...boundary, position: {
                 x: boundary.position.x + 3,
                 y: boundary.position.y
             } }
             })) {
                 console.log("colliding")
                 moving = false
                 break
             }
         }
        if (moving)
        moveables.forEach((moveable) => {
            moveable.position.x +=3
        })
    }
    else if (keys.s.pressed && lastKey === 's') {
        player.walk = true
        player.image = player.sprites.down
        // create a clone of boundary and subtract 3 from y-axis 
        // stop character from moving down when 's' is pressed
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i] 
            if (collisionDetect({
             rect1: player,
             rect2: {...boundary, position: {
                 x: boundary.position.x,
                 y: boundary.position.y -3
             } }
             })) {
                 console.log("colliding")
                 moving = false
                 break
             }
         }
        if (moving)
        moveables.forEach((moveable) => {
            moveable.position.y -=3
        })
    }
    else if (keys.d.pressed && lastKey === 'd') {
        player.walk = true
        player.image = player.sprites.right
        // create a clone of boundary and subtract 3 from x-axis 
        // stop character from moving right when 'd' is pressed
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i] 
            if (collisionDetect({
             rect1: player,
             rect2: {...boundary, position: {
                 x: boundary.position.x -3,
                 y: boundary.position.y
             } }
             })) {
                 console.log("colliding")
                 moving = false
                 break
             }
         }
        if (moving)
        moveables.forEach((moveable) => {
            moveable.position.x -=3
        })
    }
}
window.requestAnimationFrame(animate);


// listen for when player presses key and execute function
let lastKey = '';
window.addEventListener('keydown', (e) => {
    // console.log("keydown works", e.key)
    switch (e.key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            console.log("pressed w key")
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            console.log("pressed a key")
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            console.log("pressed s key")
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            console.log("pressed d key")
            break
    }
    console.log(keys)
})

// create event listener for releasing keys
window.addEventListener('keyup', (e) => {
    // console.log("keydown works", e.key)
    switch (e.key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
    console.log(keys)
})



var SCENEKeys;
var SCENEMouse;
var SCENETouch;
var SCENEMouseMove;
var SCENETouchMove;
var SCENEWidth;
var SCENEHeight;
var SCENECursor;
var SCENEFrameNo;
var SCENEInterval;
var SCENE = {
    canvas: document.createElement("canvas"),
    START: function() {
		this.canvas.setAttribute("id", "JSCSCENE");
        this.canvas.width = SCENEWidth;
        this.canvas.height = SCENEHeight;
        this.canvas.style.cursor = SCENECursor;
        this.context = this.canvas.getContext("2d");
        document.getElementById("game").appendChild(this.canvas);
        this.frameNo = SCENEFrameNo;
        this.interval = setInterval(SCENEUPDATE, SCENEInterval);
        window.addEventListener('keydown', function(e) {
            if (SCENEKeys == true) {
                SCENE.key = e.keyCode;
                SCENE.kef = e.keyCode;
                SCENE.keys = (SCENE.keys || []);
                SCENE.keys[e.keyCode] = (e.type == "keydown");
                SCENE.keyf = (SCENE.keyf || []);
                SCENE.keyf[e.keyCode] = (e.type == "keydown");
            }
        })
        window.addEventListener('keyup', function(e) {
            SCENE.key = false;
            SCENE.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('mousedown', function(e) {
            if (SCENEMouse == true) {
                SCENE.x = e.pageX;
                SCENE.y = e.pageY;
            }
        })
        window.addEventListener('mouseup', function(e) {
            SCENE.x = false;
            SCENE.y = false;
        })
        window.addEventListener('touchstart', function(e) {
            if (SCENETouch == true) {
                SCENE.x = e.pageX;
                SCENE.y = e.pageY;
            }
        })
        window.addEventListener('touchend', function(e) {
            SCENE.x = false;
            SCENE.y = false;
        })
        window.addEventListener('mousemove', function(e) {
            if (SCENEMouseMove == true) {
                SCENE.x = e.pageX;
                SCENE.y = e.pageY;
            }
        })
        window.addEventListener('touchmove', function(e) {
            if (SCENETouchMove == true) {
                SCENE.x = e.touches[0].screenX;
                SCENE.y = e.touches[0].screenY;
            }
        })
    },
    CLEAR: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    STOPINTERVAL: function() {
        clearInterval(this.interval);
    },
    CREATE: function(w, h, s) {
        this.WIDTH(w);
        this.HEIGHT(h);
        if (s == "START") {
            this.START()
        }
    },
    WIDTH: function(x) {
        return SCENEWidth = x
    },
    HEIGHT: function(x) {
        return SCENEHeight = x
    }
}

function SQUARE(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.color = color;
    this.x = x;
    this.y = y;
    this.gravity = 0;
    this.gravitySpeed = 0;
    this.bounce = 0;
    this.update = function() {
        ctx = SCENE.context;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.newPos = function() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
    }
    this.hitBottom = function() {
        if (this.y > SCENE.canvas.height - this.height) {
            this.y = SCENE.canvas.height - this.height;
            this.gravitySpeed = -(this.gravitySpeed * this.bounce);
        }
        if (this.x > SCENE.canvas.width - this.width) {
            this.x = SCENE.canvas.width - this.width;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.x < 0) {
            this.x = 0;
        }
    }
    this.clicked = function() {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var clicked = true;
        if ((mybottom < SCENE.y) || (mytop > SCENE.y) || (myright < SCENE.x) || (myleft > SCENE.x)) {
            clicked = false;
        }
        return clicked;
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

function TEXT(width, height, color, x, y, text) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.color = color;
    this.x = x;
    this.y = y;
    this.gravity = 0;
    this.gravitySpeed = 0;
    this.bounce = 0;
    this.text = text;
    this.wh = 0;
    this.update = function() {
        ctx = SCENE.context;
        ctx.font = this.width + " " + this.height;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
    }
    this.newPos = function() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
    }
    this.hitBottom = function() {
        if (this.y > SCENE.canvas.height - this.wh) {
            this.y = SCENE.canvas.height - this.wh;
            this.gravitySpeed = -(this.gravitySpeed * this.bounce);
        }
        if (this.x > SCENE.canvas.width - this.wh) {
            this.x = SCENE.canvas.width - this.wh;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.x < 0) {
            this.x = 0;
        }
    }
    this.clicked = function() {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var clicked = true;
        if ((mybottom < SCENE.y) || (mytop > SCENE.y) || (myright < SCENE.x) || (myleft > SCENE.x)) {
            clicked = false;
        }
        return clicked;
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

function IMAGE(width, height, src, x, y) {
    this.image = new Image();
    this.image.src = src;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.gravity = 0;
    this.gravitySpeed = 0;
    this.bounce = 0;
    this.update = function() {
        ctx = SCENE.context;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    this.newPos = function() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
    }
    this.hitBottom = function() {
        if (this.y > SCENE.canvas.height - this.height) {
            this.y = SCENE.canvas.height - this.height;
            this.gravitySpeed = -(this.gravitySpeed * this.bounce);
        }
        if (this.x > SCENE.canvas.width - this.width) {
            this.x = SCENE.canvas.width - this.width;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.x < 0) {
            this.x = 0;
        }
    }
    this.clicked = function() {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var clicked = true;
        if ((mybottom < SCENE.y) || (mytop > SCENE.y) || (myright < SCENE.x) || (myleft > SCENE.x)) {
            clicked = false;
        }
        return clicked;
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

function SOUND(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function() {
        this.sound.play();
    }
    this.stop = function() {
        this.sound.pause();
    }
}

function SCENEMOUSESTYLE(x) {
    return SCENECursor = x
}

function SCENEFRAMENO(x) {
    return SCENEFrameNo = x
}

function SCENEINTERVAL(x) {
    return SCENEInterval = x
}

function SCENEX() {
    return SCENE.x
}

function SCENEY() {
    return SCENE.y
}

function SCENETOUCHX() {
    return SCENE.touchX
}

function SCENETOUCHY() {
    return SCENE.touchY
}

function SCENEw() {
    return SCENE.canvas.width
}

function SCENEh() {
    return SCENE.canvas.height
}

function update(x) {
    return x.update()
}

function newPos(x) {
    return x.newPos()
}

function SCENEKEYS() {
    return (SCENEKeys = true)
}

function SCENEMOUSE() {
    return (SCENEMouse = true)
}

function SCENETOUCH() {
    return (SCENETouch = true)
}

function SCENEMOUSEMOVE() {
    return (SCENEMouseMove = true)
}

function SCENETOUCHMOVE() {
    return (SCENETouchMove = true)
}

function keyDown(x) {
    return (SCENE.key && SCENE.key == x)
}

function keyDownNoKeyUp(x) {
    return (SCENE.kef && SCENE.kef == x)
}

function keysDown(x) {
    return (SCENE.keys && SCENE.keys[x])
}

function keysDownNoKeyUp(x) {
    return (SCENE.keyf && SCENE.keyf[x])
}

function mouseDown() {
    return (SCENE.x && SCENE.y)
}

function touchStart() {
    return (SCENE.x && SCENE.y)
}

function touchMove() {
    return (SCENE.touchX && SCENE.touchY)
}

function mouseMove() {
    return (SCENE.x && SCENE.y)
}

function crashWith(x, y) {
    return (x.crashWith(y))
}

function clicked(x) {
    return (x.clicked())
}

function speedX(x, y) {
    return x.speedX = y
}

function speedY(x, y) {
    return x.speedY = y
}

function w(x, y) {
    return x.width = y
}

function h(x, y) {
    return x.height = y
}

function x(x, y) {
    return x.x = y
}

function y(x, y) {
    return x.y = y
}

function gravity(x, y) {
    return x.gravity = y
}

function gravitySpeed(x, y) {
    return x.gravitySpeed = y
}

function bounce(x, y) {
    return x.bounce = y
}

function colorValue(x, y) {
    return x.color = y
}

function textPixel(x, y) {
    return x.width = y
}

function textFont(x, y) {
    return x.height = y
}

function textValue(x, y) {
    return x.text = y
}

function textWH(x, y) {
    return x.wh = y
}

function imageSrc(x, y) {
    return x.image.src = y
}

function soundSrc(x, y) {
    return x.sound.src = y
}

function soundPlay(x) {
    return x.play()
}

function soundStop(x) {
    return x.pause()
}

function Cw(x) {
    return x.width
}

function Ch(x) {
    return x.height
}

function Cx(x) {
    return x.x
}

function Cy(x) {
    return x.y
}

function Cg(x) {
    return x.gravity
}

function Cgs(x) {
    return x.gravitySpeed
}

function Cb(x) {
    return x.bounce
}

function Cc(x) {
    return x.color
}

function Cp(x) {
    return x.width
}

function Cf(x) {
    return x.height
}

function Ct(x) {
    return x.text
}

function Ci(x) {
    return x.image.src
}

function Cs(x) {
    return x.sound.src
}

function sin(x) {
    return Math.sin(x)
}

function cos(x) {
    return Math.cos(x)
}

function tg(x) {
    return Math.tan(x)
}

function ctg(x) {
    return 1 / Math.tan(x)
}

function sec(x) {
    return 1 / Math.cos(x)
}

function cosec(x) {
    return 1 / Math.sin(x)
}

function scrt(x) {
    return Math.scrt(x)
}

function pow(x, y) {
    return Math.pow(x, y)
}

function random() {
    return Math.random()
}

function fRandomFT(x, y) {
    return (x + Math.floor((Math.random() * (y - x + 1))))
}

function radiusToAngle(x) {
    return (x * 180 / Math.PI)
}

function angleToRadius(x) {
    return (x * Math.PI / 180)
}
var PI = Math.PI;
var E = Math.E;
//Auto Settings For Start
SCENEMOUSESTYLE("");
SCENEFRAMENO(0);
SCENEINTERVAL(20);
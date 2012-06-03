var GRAVITY = 9.81;
var GRAVITY_ANGLE = Math.PI/2;
var AREA_RADIUS = 230;
var PAUSE = 1;
var GAME = 2;
var FONT_SIZE_HIGH_SCORES = 12;
var COLOR_BG = "255,255,255";
var ALPHA_BG_MAX = 0.8;
var SAW_SPEED = 200;

var buttonDown = false;
var bgAlpha = 0;
var sawNumColor = 100;
var bgImg, sawImg, stickImg, buttonUpImg, buttonDownImg, logoImg, scoresImg;
var saws;
var plank = null;
var bounceOk = true;

var canvasWidth, canvasHeight;
var sawRadius, plankWidth, plankHeight;
var buttonWidth, buttonHeight;

var state = PAUSE;
var gameTimerId;
var mouseX, mouseY;
var updateCount = 0; 

var points = 0;
var FPS = 50;
var timeCount = 0;
var request;
var records = new Array();
var topRecords = new Array(17);

// todo: strip tags, fontti

// TEMP
var forceAngle;
var forceX, forceY;

function start() {
    canvas = document.getElementById("sirkkeli_canvas");
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
    }

    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    mouseX = canvasWidth/2;
    mouseY = canvasHeight/2;
    bgImg = getImage("bg.png");
    sawImg = getImage("saw.png");
    stickImg = getImage("stick.png");
    buttonUpImg = getImage("button_up.png");
    buttonDownImg = getImage("button_down.png");
    scoresImg = getImage("scores.png");
    logoImg = getImage("logo.png");
    sawImg.onload = getSizes();
    stickImg.onload = getSizes();
    buttonUpImg.onload = getSizes();
    saws = new Array();
    plank = new Plank();
    plank.init();

    //loadRecords();

    document.addEventListener("mousemove", mouseMoveHandler, false);
    document.addEventListener("mouseup", mouseUpHandler, false);
    document.addEventListener("mousedown", mouseDownHandler, false);
    startTimer();
}

function updateGame() {
    if (state == PAUSE) {
        updateBgAlpha();
        drawPauseState();        
    } else if (state == GAME) {
        var timeIncrease = 1000/FPS;
        points += timeIncrease/30;
        timeCount += timeIncrease;
        updateGameState();
        drawGameState();
    }
}

function rotateSaws() {
    for (var i = 0; i < saws.length; i++) {
        saws[i].rotate(4.5/FPS);
    }
}

function updateBgAlpha() {
    if (bgAlpha < ALPHA_BG_MAX)
        bgAlpha += ALPHA_BG_MAX/FPS;
}

function sendPoints(name, points) {
    request.open("POST", "send_points.php", false);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("points="+points+"&name="+name);
}

function getSizes() {
    sawRadius = sawImg.width/2;
    buttonWidth = buttonUpImg.width;
    buttonHeight = buttonUpImg.height;
    sawRadius = 20; // TODO
    plankWidth = 60;
    plankHeight = 30;
    buttonWidth = 140;
    buttonHeight = 140;
}

function initTopRecords() {
    for (var i = 0; i < 17; i++) {
        topRecords[i] = null;
    }
}

function updateGameState() {    
    if (timeCount > 3000) {
        spawnSaw();
        timeCount = 0;
    }

    for (var i = 0; i < saws.length; i++) {
        saws[i].move();
    }
    rotateSaws();
    plank.move();
    plank.gravityEffect();
    plank.checkIfCollision();
    sawNumColor = 100+Math.round(155*(Math.min(timeCount,1000)/1000));
}

function drawPauseState() {
    drawGameState();

    ctx.fillStyle = "rgba(" + COLOR_BG + "," + bgAlpha + ")";
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    ctx.drawImage(scoresImg,289,170);
    ctx.drawImage(logoImg,5,5);
    var buttonImg = buttonUpImg;
    if (buttonDown)
        buttonImg = buttonDownImg;
    ctx.drawImage(buttonImg,canvasWidth/2-buttonWidth/2,canvasHeight/2-buttonHeight/2);

    ctx.font = "10pt Arial";
    ctx.fillStyle = "rgb(230,230,230)";
    for (var i = 0; i < topRecords.length; i++) {
        ctx.fillText(topRecords[i].name,312,207+i*(FONT_SIZE_HIGH_SCORES+3));
        ctx.fillText(topRecords[i].points,440-7*(topRecords[i].points > 999),207+i*(FONT_SIZE_HIGH_SCORES+3));
    }
    ctx.font = "10pt Arial";
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillText("BETA",400,170);
    ctx.fillText("Design & Programming",15,370);
    ctx.fillText("Graphics",15,390);
    ctx.fillText("Logo",15,410);
    ctx.fillText("Head of QA",15,430);
    ctx.fillText("Marketing Manager",15,450);
    ctx.fillText("Trololo Assistant",15,470);
    ctx.fillStyle = "rgb(120,120,245)";
    ctx.fillText("Tiksa",160,370);
    ctx.fillText("Hatfuls",160,390);
    ctx.fillText("kt Olli",160,410);
    ctx.fillText("Pera",160,430);
    ctx.fillText("Artsi",160,450);
    ctx.fillText("Aku Ankka",160,470);
}

function drawGameState() {
    ctx.clearRect(0,0,canvasWidth,canvasHeight);
    ctx.drawImage(bgImg,0,0);
    for (var i = 0; i < saws.length; i++) {
        saws[i].draw();
    }
    plank.draw();
    ctx.fillStyle = "rgb("+sawNumColor+","+sawNumColor+",255)";    
    ctx.font = "23pt Futura";
    ctx.fillText(saws.length,39-(saws.length > 9)*10,58);
    // debug
    /*ctx.drawText("Arial",10,50,100,"a_x:"+plank.a_x);
    ctx.drawText("Arial",10,50,120,"a_y:"+plank.a_y);
    ctx.drawText("Arial",10,50,140,"forceX:"+forceX);
    ctx.drawText("Arial",10,50,160,"forceY:"+forceY);
    ctx.drawText("Arial",10,50,180,"omega:"+plank.omega);
    ctx.drawText("Arial",10,50,200,"forceAngle:"+forceAngle);*/
    //ctx.drawText("Arial",10,250,160,plank.a_x);
    //ctx.drawText("Arial",10,250,180,plank.a_x);
    //for (var i = 0; i < plank.edgePoints.length; i++) {
    //    ctx.fillRect(plank.edgePoints[i].x,plank.edgePoints[i].y,3,3);
    //}
}

function spawnSaw() {
    var x, y;
    do {   
        var spawnAngle = randFloat(0,2*Math.PI);
        x = canvasWidth/2 + Math.cos(spawnAngle)*randInt(0, AREA_RADIUS - sawRadius);
        y = canvasHeight/2 + Math.sin(spawnAngle)*randInt(0, AREA_RADIUS - sawRadius);

            var overOtherSaw = false;
        for (var i = 0; i < saws.length; i++) {
           if (distance(x,y,saws[i].x,saws[i].y) < 2*sawRadius)
              overOtherSaw = true;
        }
        } while (overOtherSaw || distance(x, y, plank.x, plank.y) < 200);
    var angle = randFloat(0, 2*Math.PI);
    saws.push(new Saw(x, y, angle));
}

function newGame() {
    state = GAME;
    timeCount = 0;    
    saws = [];
    points = 0;
    spawnSaw();
    plank.init();
}

function pauseGame() {
    state = PAUSE;
    bgAlpha = 0;
    points = Math.round(points);
    if (points > topRecords[9].points) {
        var name = prompt("Arvon palikka, pääsit ennätyslistalle pistemäärällä " + points +"! Kuka olet?","tuntematoin");
        name = name.substring(0,15);
        sendPoints(name,points);    
        loadRecords();
    }
}

function startTimer() {
    if (!gameTimerId) {
        gameTimerId = setInterval("updateGame()", 1000/FPS);
    }
}

function mouseMoveHandler(event) {
    mouseX = event.clientX - canvas.offsetLeft;
    mouseY = event.clientY - canvas.offsetTop;
}

function mouseUpHandler(event) {
    buttonDown = false;
    if (state == PAUSE && distance(canvasWidth/2,canvasHeight/2,mouseX,mouseY) < 55) {
        newGame();
    }
}

function mouseDownHandler(event) {
    if (state == PAUSE && distance(canvasWidth/2,canvasHeight/2,mouseX,mouseY) < 55) {
        buttonDown = true;
    }
}

function getImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}

function loadRecords() {
    initTopRecords();
    if (window.ActiveXObject) {
        request = new ActiveXObject("Microsoft.XMLHTTP");        
    } else if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
    }

    request.open("GET", "get_records.php", false);
    request.send(null);
    var lines = request.responseText.split("\n");
    var record;
    for (var i = 0; i < lines.length - 1; i++) {
        var parts = lines[i].split("|");
        record = new Record(parts[1],parseInt(parts[0]));
        for (var j = 0; j < topRecords.length; j++) {
            if (topRecords[j] == null || record.points > topRecords[j].points) {
                for (var k = topRecords.length-1; k > j; k--) {
                    topRecords[k] = topRecords[k-1];
                }
                topRecords[j] = record;
                j = topRecords.length;
            }
        }
        records.push(record);
    }
}

function Record(name, points) {
    this.name = name;
    this.points = points;
}

function Point(x, y) {
    this.x = x;
    this.y = y;

    this.setCoords = function(x, y) {
        this.x = x;
        this.y = y;
    }
}

function Plank() {

    this.init = function() {
        this.x = mouseX;
        this.y = mouseY;
        this.angle = GRAVITY_ANGLE;
        this.oldX = this.x;
        this.oldY = this.y;
        this.v_x = 0;
        this.v_y = 0;
        this.oldVX = 0;
        this.oldVY = 0;
        this.a_x = 0;
        this.a_y = 0;
        this.omega = 0;
        this.edgePoints = new Array();
        for (var i = 0; i < 6; i++) {
            this.edgePoints.push(new Point(-1,-1));
        }
    }

    this.move = function() {
        if (updateCount == 0) {
            this.oldX = this.x;
            this.oldY = this.y
            this.oldVX = this.v_x;
            this.oldVY = this.v_y;
        }
        this.x = mouseX;
        this.y = mouseY;
        if (updateCount == 5) {
            this.v_x = (this.x - this.oldX);
            this.v_y = (this.y - this.oldY);
            this.a_x = (this.v_x - this.oldVX);
            this.a_y = (this.v_y - this.oldVY);
        }
        updateCount++;
        if (updateCount == 6) {
            updateCount = 0;
        }
    }

    this.draw = function() {
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.angle);
        ctx.translate(-this.x,-this.y);
        ctx.drawImage(stickImg,this.x, this.y-15);
        ctx.restore();
    }

    this.gravityEffect = function() {
        forceX = Math.cos(GRAVITY_ANGLE)*GRAVITY - this.v_x/3;
        forceY = Math.sin(GRAVITY_ANGLE)*GRAVITY - this.v_y/3;
            
        forceAngle = Math.atan(forceY/forceX);
        if (forceY > 0 && forceX < 0)
            forceAngle += Math.PI;
        if (forceY < 0 && forceX < 0)
            forceAngle += Math.PI;
        
        forceAngle = forceAngle % (2*Math.PI);

        var diff = (this.angle - forceAngle);
        if (diff > Math.PI) {
            diff = Math.PI - (diff - Math.PI);
        }
        if (diff < -Math.PI) {
            diff = -Math.PI + (-Math.PI - diff);
        }
        var alfa = diff/25;
        if (alfa > 0)
            alfa += Math.abs(this.omega)*(0.45 + 0.01*Math.sqrt(this.v_x*this.v_x + this.v_y*this.v_y));
        if (alfa < 0)
            alfa -= Math.abs(this.omega)*(0.45 + 0.01*Math.sqrt(this.v_x*this.v_x + this.v_y*this.v_y));

        this.omega += alfa*30/FPS;
        if (this.omega > 0.5)
            this.omega = 0.5;
        if (this.omega < -0.5)
            this.omega = -0.5;
        this.rotate(-this.omega);
        this.updateEdgePoints();
    }

    this.updateEdgePoints = function() {
        var angleAdd = Math.atan(plankHeight/2/plankWidth);
        var angleAddHalf = Math.atan(plankHeight/2/plankWidth*2)
        var hypotenuse = Math.sqrt(plankWidth*plankWidth + plankHeight*plankHeight/2/2);
        var halfHypotenuse = Math.sqrt(plankWidth*plankWidth/2/2 + plankHeight*plankHeight/2/2)
        var x = this.x;
        var y = this.y;
        this.edgePoints[0].setCoords(x+Math.cos(this.angle+angleAdd)*hypotenuse,y+Math.sin(this.angle+angleAdd)*hypotenuse);
        this.edgePoints[1].setCoords(x+Math.cos(this.angle-angleAdd)*hypotenuse,y+Math.sin(this.angle-angleAdd)*hypotenuse);
        this.edgePoints[2].setCoords(x-Math.sin(this.angle)*plankHeight/2,y+Math.cos(this.angle)*plankHeight/2);
        this.edgePoints[3].setCoords(x+Math.sin(this.angle)*plankHeight/2,y-Math.cos(this.angle)*plankHeight/2);
        this.edgePoints[4].setCoords(x+Math.cos(this.angle+angleAddHalf)*halfHypotenuse,y+Math.sin(this.angle+angleAddHalf)*halfHypotenuse);
        this.edgePoints[5].setCoords(x+Math.cos(this.angle-angleAddHalf)*halfHypotenuse,y+Math.sin(this.angle-angleAddHalf)*halfHypotenuse);
    }

    this.rotate = function(radians) {
        this.angle = (this.angle + radians) % (2*Math.PI);
    }

    this.checkIfCollision = function() {
        // with wall
        // TODO
        for (var i = 0; i < this.edgePoints.length; i++) {
            if (distance(this.edgePoints[i].x,this.edgePoints[i].y,canvasWidth/2,canvasHeight/2) > AREA_RADIUS) {
                pauseGame();
            }            
        }
        // with a saw
        for (var i = 0; i < saws.length; i++) {
            for (var j = 0; j < plank.edgePoints.length; j++) {
                if (distance(this.edgePoints[j].x,this.edgePoints[j].y,saws[i].x,saws[i].y) < sawRadius) {
                    pauseGame();
                }
                
            }
        }
    }
}

function Saw(x, y, dir) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.angle = 0;
    this.v = SAW_SPEED/FPS;
    this.bounces = new Array();

    this.draw = function() {
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.angle);
        ctx.translate(-this.x,-this.y);
        ctx.drawImage(sawImg, this.x-sawRadius, this.y-sawRadius);
        ctx.restore();
    }

    this.move = function() {
        for (var i = 0; i < 1; i++) {
            for (var j = 0; j < this.v; j++) {
                this.x += Math.cos(this.dir);
                this.y += Math.sin(this.dir);
                this.bounceIfNeeded();                
            }
        }
    }

    this.bounceIfNeeded = function() {
        if (distance(this.x,this.y,canvasWidth/2,canvasHeight/2) > AREA_RADIUS - sawRadius) {
            this.bounceFromWall();
        }
        for (var i = 0; i < saws.length; i++) {
            if (distance(this.x,this.y,saws[i].x,saws[i].y) < 2*sawRadius && 
                !this.equals(saws[i])) {
                this.bounceFromSaw(saws[i]);
            } else {
                if (!this.equals(saws[i])) {
                    if (contains(this.bounces, saws[i]))
                        this.bounces.splice(this.bounces.indexOf(saws[i]), 1);
                    if (contains(saws[i].bounces, this))
                        saws[i].bounces.splice(saws[i].bounces.indexOf(this), 1);
                }
            }
        }
    }

    this.bounceFromWall = function() {
        var wallAngle = Math.atan((this.y-canvasHeight/2)/(this.x-canvasWidth/2));
        this.dir = wallAngle + Math.PI + wallAngle - this.dir;
    }

    this.bounceFromSaw = function(other) {            
        var bounceOk = true;
        if (contains(this.bounces, other))
            bounceOk = false;
        if (contains(other.bounces, this))
            bounceOk = false;

        if (bounceOk) {
            var vx1 = Math.cos(this.dir)*this.v;
            var vy1 = Math.sin(this.dir)*this.v;
            var vx2 = Math.cos(other.dir)*other.v;
            var vy2 = Math.sin(other.dir)*other.v;
            var xDist = (vx1-vx2)*(vx1-vx2);
            var yDist = (vy1-vy2)*(vy1-vy2);
            var d = 4*sawRadius*sawRadius;
            
            var xCompA = vx2*Math.sqrt(d - yDist)/(2*sawRadius);
            var yCompA = vy2*(1 - (Math.sqrt(d - xDist)/(2*sawRadius)));
            var yCompB = vy2*Math.sqrt(d - xDist)/(2*sawRadius);
            var xCompB = vx2*(1 - (Math.sqrt(d - yDist)/(2*sawRadius)));
            var xCompA2 = vx1*Math.sqrt(d - yDist)/(2*sawRadius);
            var yCompA2 = vy1*(1 - (Math.sqrt(d - xDist)/(2*sawRadius)));
            var yCompB2 = vy1*Math.sqrt(d - xDist)/(2*sawRadius);
            var xCompB2 = vx1*(1 - (Math.sqrt(d - yDist)/(2*sawRadius)));

            vx1 = xCompA + positive(xCompA)*Math.abs(yCompA);
            vy1 = yCompB + positive(yCompB)*Math.abs(xCompB);
            vx2 = xCompA2 + positive(xCompA2)*Math.abs(yCompA2);
            vy2 = yCompB2 + positive(yCompB2)*Math.abs(xCompB2);


            this.dir = getDir(vx1, vy1);
            other.dir = getDir(vx2, vy2);

            //alert(this.dir + " " + vx1 + " " + vy1 + " " + other.dir + " " + vx2 + " " + vy2);
            this.bounces.push(other);
            other.bounces.push(this);
        }
    }

    this.rotate = function(radians) {
        this.angle += radians;
    }

    this.equals = function(other) {
        if (this.x == other.x && this.y == other.y && this.dir == other.dir)
            return true;
        else
            return false;
    }
}

function contains(array, object) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].equals(object)) {
            return true;
        }
    }
    return false;
}

function positive(x) {
    if (x > 0)
        return 1;
    else
        return -1;
}

function getDir(vx, vy) {
    var angle = Math.atan(vy/vx);
    
    if ((vx < 0 && vy < 0) || (vx < 0 && vy > 0)) {
        angle += Math.PI;
    }
    return angle;
}

function randFloat(from, to) {
    return Math.random()*(to - from + 1) + from;
}

function randInt(from, to) {
    return Math.floor(Math.random()*(to - from + 1)) + from;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}
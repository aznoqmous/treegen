var lastFrameSec, tLast = Date.now();

$(function(){
  var m = new Master();
  function loop(){
    lastFrameSec = Date.now() - tLast;
    tLast = Date.now();
    m.do();
    requestAnimationFrame(loop);
  }
  loop();

});

class Master{

  constructor(){
    this.c = document.getElementById("canvas");
    this.ctx = this.c.getContext("2d");
    this.dots = [];
    this.resizeSelf();
    this.syms = 5;

    this.sum = 0;
    this.count = 0;
    this.avg = 0;

    this.frame = 0;
    this.tfps = Date.now();

    this.targetPerf = 50;

    this.offTh = 0;
    this.thSpeed = 0;
  }
  do(){
    this.clear();
    // console.log(getTimeFrameSec());
    this.fps();
    this.getAvgPref();
    this.doDots();
    this.removeDots();
    // requestAnimationFrame(this.do);
  }
  createDot(x, y, th, gen){
    var newDot = new Dot(x, y, th, gen);
    this.dots.push(newDot);
  }
  drawDot(dot){
    this.ctx.fillStyle = dot.getColor();
    // this.ctx.fillStyle = "#000";
    var dotSize = dot.getSize();
    // this.ctx.beginPath();
    // this.ctx.arc(dot.x-dotSize/2, dot.y-dotSize/2, dotSize, 0, 2*Math.PI);
    // this.ctx.fill();

    var x, y, x2, y2;
    for (var i = 0; i < this.syms; i++) {
      x = dot.x-dotSize/2;
      y = dot.y-dotSize/2;
      var offTh = this.offTh/360;
      // var offTh = 0;
      x2 = x * Math.cos((i+offTh)/this.syms*2*Math.PI) - y * Math.sin((i+offTh)/this.syms*2*Math.PI);
      y2 = x * Math.sin((i+offTh)/this.syms*2*Math.PI) + y * Math.cos((i+offTh)/this.syms*2*Math.PI);
      this.ctx.beginPath();
      this.ctx.arc( x2 + this.c.width/2, y2 + this.c.height/2, dotSize, 0, 2*Math.PI);
      this.ctx.fill();
    }
  }
  strokeDot(dot){

    this.ctx.fillStyle = "rgba(0, 255, 180, 0.1)";
    this.ctx.strokeStyle = "rgba(0, 255, 180, 0.3)";
    var dotSize = dot.getSize();
    this.ctx.beginPath();
    this.ctx.arc(dot.x-dotSize/2, dot.y-dotSize/2, dotSize, 0, 2*Math.PI);
    this.ctx.stroke();
    this.ctx.fill();

  }
  doDots(){
    this.offTh += this.thSpeed;
    for (var i = 0; i < this.dots.length; i++) {
      var dot = this.dots[i];
      this.drawDot(dot);
      dot.move();
    }
  }
  removeDots(){
    var deadDots = [];
    for (var i = 0; i < this.dots.length; i++) {
      var dot = this.dots[i];
      if(!dot.alive) {

        if(this.isIn(dot) && dot.gen <= dot.maxGen &&  lastFrameSec < 1000/this.targetPerf) this.nextGen(dot.gen, dot);

        deadDots.push(i);
      }
    }
    if(this.dots.length - deadDots.length <= 0) {
      var lastDot = this.dots[this.dots.length-1];

      this.newTree();
    }

    for (var i = 0; i < deadDots.length; i++) {
      this.dots.splice(deadDots[i]-i, 1);
    }
  }
  newTree(){
    this.offTh = 0;
    this.createDot(20, 20, Math.random()*2*Math.PI, 1);
  }
  nextGen(val, dot){
    for (var i = 0; i < val; i++) {
      this.createDot(dot.x, dot.y, dot.th, dot.gen+1+i);
    }
  }
  isIn(dot){
    if(dot.x > -this.c.width/2 && dot.x < this.c.width/2 && dot.y > -this.c.height/2 && dot.y < this.c.height/2) return true;
    return false;
  }
  clear(){
    this.ctx.globalAlpha = 0.01;
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(0, 0, this.c.width, this.c.height);
    this.ctx.globalAlpha = 1;
  }
  resizeSelf(){
    this.c.width = $(window).width();
    this.c.height = $(window).height();
  }
  getAvgPref(){
    var lastFrame = getTimeFrameSec();
    this.sum += lastFrame;
    this.count++;
    this.avg = this.sum/this.count;
    if(lastFrame > 1000/this.targetPerf){
      console.log("long");
    }
  }
  fps(){
    this.frame++;
    if(Date.now() - this.tfps > 1000){
      $("#fps").html(this.frame+"-"+lastFrameSec);
      this.frame = 0;
      this.tfps = Date.now();
    }
  }
}

class Dot{
  constructor(x, y, th, gen){
    this.x = x;
    this.y = y;
    this.th = th;
    this.speed = 1;
    this.size = 1;
    this.life = 0;
    this.gen = gen;
    this.maxGen = 20;
    this.lifeLen = (50+100*(this.maxGen-this.gen)/this.maxGen)/this.speed/4;
    // this.lifeLen = 20;
    this.offTh = (Math.random()*2-1)*((this.gen/this.maxGen)/this.lifeLen*2+(this.maxGen-this.gen)/this.maxGen/this.lifeLen/2);
    // this.offTh = (Math.random()*2-1)*(this.gen/this.maxGen)/this.lifeLen*2;
    this.alive = 1;
    this.baseR = 50 + Math.random()*50;
    this.baseG = 100 + Math.random()*100;
    this.baseB = 50;
  }
  getSize(){
    // return (this.maxGen-this.gen)+1;
    return this.size;
  }
  getColor(){
    // console.log((this.maxGen-this.gen+1)/10);
    return 'rgb('+Math.floor((this.gen/this.maxGen)*this.baseR)+','+Math.floor((this.gen/this.maxGen)*this.baseG)+','+Math.floor((this.gen/this.maxGen)*this.baseB)+')';
  }
  getSpeed(){
    var speedX = Math.sin(this.th)*this.speed;
    var speedY = -Math.cos(this.th)*this.speed;
    return {x: speedX, y: speedY}
  }
  move(){
    this.life++;
    if(this.life > this.lifeLen) this.alive = 0;
    this.th += this.offTh;
    this.x += this.getSpeed().x;
    this.y += this.getSpeed().y;
  }

}

function getTimeFrameSec(){
  return lastFrameSec;
}

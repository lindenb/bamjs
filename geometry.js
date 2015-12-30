function Point() {
  if(arguments.length == 2 ) {
    this.x=arguments[0];
    this.y=arguments[1];
    }  else if(arguments.length == 1 ) {
    this.x=arguments[0].x;
    this.y=arguments[0].y;
    }  else  {
    this.x = 0.0;
    this.y = 0.0;
    } 
}

Point.prototype.getX = function() { return this.x ;}
Point.prototype.getY = function() { return this.y ;}
Point.prototype.distance = function() {
  var x,y;
  if( arguments.length == 1 ) {azd
    x = arguments[0].getX();
    y = arguments[0].getY(); 
    }
  else {
    x= arguments[0];
    y= arguments[1];
  }
  return Math.sqrt(Math.pow((this.getX()-x),2)+Math.pow((this.getY()-y),2));
  }
Point.prototype.toString = function() { return "("+this.getX()+","+this.getY()+")" ;}


function Dimension() {
if(arguments.length == 2 ) {
this.width = arguments[0];
this.height = arguments[1];
}  else if(arguments.length == 1 ) {
this.width = arguments[0].width;
this.height = arguments[0].height;
}  else  {
this.width = 0.0;
this.height = 0.0;
} 
}

Dimension.prototype.getWidth = function() { return this.width ;}
Dimension.prototype.getHeight = function() { return this.height ;}





function Rectangle() {
if(arguments.length == 4 ) {
this.x=arguments[0];
this.y=arguments[1];
this.width=arguments[2];
this.height=arguments[3];
} else if( arguments.length == 1) {
this.x=arguments[0].x;
this.y=arguments[0].y;
this.width=arguments[0].width;
this.height=arguments[0].height;
} else {
this.x=0;
this.y=0;
this.width=0;
this.height=0;
}
}
Rectangle.prototype.getX = function() { return this.x; }
Rectangle.prototype.getY = function() { return this.y; }
Rectangle.prototype.getWidth = function() { return this.width; }
Rectangle.prototype.getHeight = function() { return this.height; }

Rectangle.prototype.getMaxX = function() {
return this.getX() + this.getWidth();
}
Rectangle.prototype.getMaxY = function() {
return this.getY() + this.getHeight();
}
Rectangle.prototype.getCenterX = function() {
return this.getX() + this.getWidth()/2.0;
}
Rectangle.prototype.getCenterY = function() {
return this.getY() + this.getHeight()/2.0;
}
Rectangle.prototype.getCenter = function() {
return new Point(this.getCenterX(), this.getCenterY());
}

Rectangle.prototype.scaled = function(ratio)
  {
  var w=this.getWidth()*ratio;
  var h=this.getHeight()*ratio;
  var x=this.getX()+(this.getWidth()-w)/2.0;
  var y=this.getY()+(this.getHeight()-h)/2.0;
  return new Rectangle(x,y,w,h);
  }

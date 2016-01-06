/* SVG utilities */
var SVG = {
NS : "http://www.w3.org/2000/svg",
PREFIX : "svg",
document: null,
dom: function() { return this.document == null ? document : this.document; },
createElement : function(name) {
	return this.dom().createElementNS(this.NS,name);
	},
createVGradient : function(gradId,styleTop,styleMid) {
  var g = this.createElement("linearGradient");
  g.setAttribute("id",gradId);
  g.setAttribute("x1","50%");
  g.setAttribute("x2","50%");
  g.setAttribute("y1","0%");
  g.setAttribute("y2","100%");
  var s = this.createElement("stop");
  g.appendChild(s);
  s.setAttribute("offset","0%");
  s.setAttribute("style",styleTop);
  
  s = this.createElement("stop");
  g.appendChild(s);
  s.setAttribute("offset","50%");
  s.setAttribute("style",styleMid);

  s = this.createElement("stop");
  g.appendChild(s);
  s.setAttribute("offset","100%");
  s.setAttribute("style",styleTop);
  return g;
  },
createDefs : function() { return this.createElement("defs");},
createPath : function() { return this.createElement("path");},
createUse : function() { return this.createElement("use");},
createStyle : function() { return this.createElement("style");},
createGroup : function() { return this.createElement("g");},
createRect : function() {
  var r = this.createElement("rect");
  var rect;
  if(arguments.length==1 && arguments[0] instanceof Rectangle) {
    rect = arguments[0];
    }
  else if( arguments.length == 4) 
  {
    rect = new Rectangle(arguments[0],arguments[1],arguments[2],arguments[3]);
  }
  else {
      rect = new Rectangle();
  }
  r.setAttribute("x",rect.getX());
  r.setAttribute("y",rect.getY());
  r.setAttribute("width",rect.getWidth());
  r.setAttribute("height",rect.getHeight());
  return r;
},
createLine : function() {
  var r = this.createElement("line");
  var rect;
  if(arguments.length==1 && arguments[0] instanceof Line) {
    rect = arguments[0];
    }
  else if( arguments.length == 4) 
  {
    rect = new Rectangle(arguments[0],arguments[1],arguments[2],arguments[3]);
  }
  else {
      rect = new Rectangle();
  }
  r.setAttribute("x",rect.getX());
  r.setAttribute("y",rect.getY());
  r.setAttribute("width",rect.getWidth());
  r.setAttribute("height",rect.getHeight());
  return r;
},
createText : function() {
  var r = this.createElement("text");

  if( arguments.length == 3) 
  {
  r.setAttribute("x",arguments[0]);
  r.setAttribute("y",arguments[1]);
  r.appendChild( SVG.dom().createTextNode( arguments[2] ) )
  }
  return r;
},
createTitle : function() {
  var r = this.createElement("title");

  if( arguments.length == 1) 
  {
  r.appendChild( SVG.dom().createTextNode( arguments[0] ) )
  }
  return r;
}
};

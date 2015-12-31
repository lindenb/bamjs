function SamXY(context,rec)
  {
  this.context = context;
  this.record = rec;
  }

SamXY.prototype.getStart = function() {
return this.context.showClipping ?
  this.record.getUnclippedStart() :
  this.record.getAlignmentStart();
}

SamXY.prototype.getEnd = function() {
return this.context.showClipping ?
  this.record.getUnclippedEnd() :
  this.record.getAlignmentEnd();
}


function SVGBrowser()
	{
	this.HEIGHT_MAIN_TITLE=100;
	this.HEIGHT_SAMPLE_NAME=50;
	this.HEIGHT_RULER=200;
	this.drawinAreaWidth = 1000;
	this.showClipping = true;
	this.hershey = new Hershey(),
	this.interval = new Interval("",0,0),
	this.featureHeight = 10.0;
	this.featureWidth = 10.0;
	}

SVGBrowser.prototype.format = function(v)
    {
    return v;
    }
SVGBrowser.prototype.trim = function( pos0)
    {
    return Math.min(Math.max(pos0, this.interval.getStart()),this.interval.getEnd());
    }
SVGBrowser.prototype.baseToPixel = function(pos)
    {
    return  ((pos - this.interval.getStart())/this.interval.distance())*(this.drawinAreaWidth);
    }
SVGBrowser.prototype.build = function(svgRoot,interval,reads)
    {
    this.interval = interval;
    
    var defsNode = SVG.createDefs();
    svgRoot.appendChild(defsNode);
    
    //bases
    var acidNucleics = ["a","A","t","T","g","G","c","C","n","N"];
    for(var i in acidNucleics)
	    {
	    var base= acidNucleics[i];
	    var path = SVG.createPath();
	    defsNode.appendChild(path);
	
	    path.setAttribute("id","b"+base);
	    path.setAttribute("title",base);
	    path.setAttribute("class","b"+base.toUpperCase());
	    path.setAttribute("d",this.hershey.svgPath(
			    base,
			    0,
			    0,
			    this.featureWidth*0.95,
			    this.featureHeight*0.95
			    ));
	    }
    
    
    
    var rows=[];
    var y=0;
    for(var i=0; i< reads.length;++i)
      {
      var xyrecord = new  SamXY(this,reads[i]);
      for(var j=0;j< rows.length;++j)
	{
	var row = rows[j];
        var last = row[ row.length -1 ];
        if( this.baseToPixel( last.getEnd() ) <=  this.baseToPixel( xyrecord.getStart() ) ) continue;
	xyrecord.y = j;
        row.push(xyrecord);
	xyrecord=null;
        break;
	}
      if( xyrecord != null )
      {
	var row=[];
	xyrecord.y = rows.length;
	row.push(xyrecord);
	rows.push(row);
      }
      }
    var gAllReads = SVG.createGroup();
    svgRoot.appendChild(gAllReads);
    for(var i in rows)
    {
      var row=rows[i];
      var gRow = SVG.createGroup();
      gAllReads.appendChild(gRow);
      gRow.setAttribute("transform","translate(0,"+(i)+")");
      for(var j in row)
      {
	var xyrecord = row[j];
	var gread =  SVG.createGroup();
	gRow.appendChild(gread);
	var path = SVG.createPath();
	var d="";
	if( xyrecord.record.getStrand()=='+') 
	{
	  d="x";
	}
	else
	{
	  d="y";
	}
	path.setAttribute("d",d);
	gread.appendChild(path);
      }
      
    }
    
    
    }
    
    

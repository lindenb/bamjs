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
SVGBrowser.prototype.mid_y = function()
    {
    return this.featureHeight/2.0;
    }
SVGBrowser.prototype.y_h95 = function()
    {
    return this.featureHeight*0.90;
    }  
 SVGBrowser.prototype.y_top5 = function()
    {
    return (this.featureHeight-this.y_h95())/2.0;;
    } 
 SVGBrowser.prototype.y_bot5 = function()
    {
    return this.y_top5()+ this.y_h95();
    } 
 SVGBrowser.prototype.arrow_w = function()
    {
    return this.featureHeight/3.0;
    } 
 
 SVGBrowser.prototype.createArrow = function(strand, match_start, match_end)
    {
    var sb="";
    /*
    var arrow_w= this.featureHeight/3.0;
    if( strand=='-' &&
	  match_start >= this.interval.start && 
	  match_start <= this.interval.end )
	  {
	  sb.append(" M ").append(format(baseToPixel(match_start)+arrow_w)).append(',').append(y_top5);
	  sb.append(" h ").append(format(baseToPixel(trim(match_end))-baseToPixel(match_start)-arrow_w));
	  sb.append(" v ").append(format(y_h95));
	  sb.append(" h ").append(format(-(baseToPixel(trim(match_end))-baseToPixel(match_start)-arrow_w)));
	  sb.append(" L ").append(format(baseToPixel(match_start))).append(',').append(mid_y);
	  sb.append(" Z");
	  }
    else if(strand == '+' &&
	      match_end >= this.interval.start && 
	      match_end <= this.interval.end 
	      )
	    {
	    sb.append(" M ").append(format(baseToPixel(match_end)-arrow_w)).append(',').append(y_top5);
	    sb.append(" h ").append(format(-(baseToPixel(match_end)-baseToPixel(trim(match_start))-arrow_w)));
	    sb.append(" v ").append(format(y_h95));
	    sb.append(" h ").append(format(baseToPixel(match_end)-baseToPixel(trim(match_start))-arrow_w));
	    sb.append(" L ").append(format(baseToPixel(match_end))).append(',').append(mid_y);
	    sb.append(" Z");
	    }
    else
	    {
	    sb.append(" M ").append(format(baseToPixel(trim(match_start)))).append(',').append(y_top5);
	    sb.append(" h ").append(format(baseToPixel(trim(match_end))-baseToPixel(trim(match_start))));
	    sb.append(" v ").append(format(y_h95));
	    sb.append(" h ").append(format(-(baseToPixel(trim(match_end))-baseToPixel(trim(match_start)))));
	    sb.append(" Z");
	    }
	    */
    return sb;
    }
    
    
SVGBrowser.prototype.build = function(svgRoot,interval,reads)
    {
    this.interval = interval;
    
    this.featureWidth=  this.drawinAreaWidth/this.interval.distance(); 
    this.featureHeight= Math.min(Math.max(5.0,this.featureWidth),30); 
    this.HEIGHT_RULER= (""+this.interval.end).length*this.featureHeight+5;
				
    
    var defsNode = SVG.createDefs();
    svgRoot.appendChild(defsNode);
    svgRoot.setAttribute("width",this.drawinAreaWidth);
    
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
      gRow.setAttribute("transform","translate(0,"+(i*this.featureHeight)+")");
      for(var j in row)
      {
	var xyrecord = row[j];
	var unclipped_start= xyrecord.record.getUnclippedStart();
	var gread =  SVG.createGroup();
	gRow.appendChild(gread);
	/* find position of arrow */
	var arrow_cigar_index=-1;
	
	for(var cidx=0; cidx< xyrecord.record.getCigar().size(); cidx++ )
		{
		var ce = xyrecord.record.getCigar().get(cidx);
		var op = ce.getOperator();
		switch(op.letter)
			{
			case 'H':case 'S': if(!this.showClipping) break;//threw
			case 'M':case '=': case 'X':
				{
				arrow_cigar_index=cidx;
				}
			default:break;
			}
		if(xyrecord.record.getStrand()=='-' && arrow_cigar_index!=-1)
			{
			break;
			}
		}
	/* loop over cigar string */
	var refPos = unclipped_start;
	var readPos = 0;
	var pos2insertions={};
	
		
	for(var cidx=0; cidx< xyrecord.record.getCigar().size(); cidx++ )
		{
		var ce = xyrecord.record.getCigar().get(cidx);
		var op = ce.getOperator();
		var in_clip=false;
		switch(op.letter)
			{
		        case 'P': break;
			case 'D':
			case 'N':
				{
				var c_start = this.trim(refPos);
				var c_end   = this.trim(refPos + ce.getLength());
				if(c_start<c_end)
					{
					var L= SVG.createLine();
					L.setAttribute("class","indel");
					L.setAttribute("title", op.name()+ce.getLength());
					L.setAttribute("x1", this.format(this.baseToPixel(c_start)));
					L.setAttribute("x2", this.format(this.baseToPixel(c_end)));
					L.setAttribute("y1", this.format(this.mid_y()));
					L.setAttribute("y2", this.format(this.mid_y()));
					gread.appendChild(L);
					}
				refPos += ce.getLength();
				break;
				}
			case 'I': 
				{
				var sb="";
				for(var i=0;i< ce.getLength();++i)
					{
					sb += (xyrecord.record.charAt(readPos++));
					}
				pos2insertions.put(""+refPos, sb );
				break;
				}
			case 'H':
				{
				if(!this.showClipping)
					{
					refPos += ce.getLength();
					break;
					}
				in_clip=true;
				//NO break;
				}
			case 'S':
			      {
			break;
			      }
			case 'M':
			case 'X':
			case '=':
			      {
			      
			      break;
			      }
			default: throw "unknown operator "+ce+"/"+op.letter;
			}
		}
      //print insertions
      
      for(var posStr in pos2insertions)
	  {
	  var pos = parseInt(posStr);
	  if(pos < this.interval.start)  continue;
	  if(pos > this.interval.end)  continue;
	  var insertion = pos2insertions.get(pos);
	  var L = SVG.createLine();
	  var x= this.baseToPixel(pos);
	  L.setAttribute("title","Insertion "+insertion);
	  L.setAttribute("class","insert");
	  L.setAttribute("x1",this.format(x));
	  L.setAttribute("x2",this.format(x));
	  L.setAttribute("y1",this.format(this.y_top5()));
	  L.setAttribute("y2",this.format(this.y_bot5()));
	  gread.appendChild(L);
	  }
      
      }
      
    }
    
    svgRoot.setAttribute("height",(rows.length * this.featureHeight) );
    }
    
    

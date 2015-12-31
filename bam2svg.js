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
 
 SVGBrowser.prototype.getCss = function()
    {
    return "g.maing {stroke:black;stroke-width:0.5px;fill:none;}\n"+
	  ".maintitle {stroke:blue;fill:none;}\n"+
	  ".bA {stroke:green;}\n" + 
	  ".bC {stroke:blue;}\n" +
	  ".bG {stroke:black;}\n" +
	  ".bT {stroke:red;}\n" +
	  ".bN {stroke:gray;}\n" +
	  ".homvar {stroke:blue;fill:blue;}\n"+
	  ".het {stroke:blue;fill:blue;}\n"+
	  "path.c {stroke:gray;}\n"+
	  "line.insert {stroke:red;stroke-width:4px;}\n"+
	  "line.rulerline {stroke:lightgray;stroke-width:0.5px;}\n"+
	  "line.rulerlabel {stroke:gray;stroke-width:2px;}\n"+
	  "path.maintitle {stroke:blue;stroke-width:5px;}\n"+
	  "path.samplename {stroke:black;stroke-width:3px;}\n"+
	  "circle.mutation {stroke:red;fill:none;stroke-width:"+(this.featureWidth<5?0.5:3.0)+"px;}"
	  ;
    }
    
    
SVGBrowser.prototype.build = function(svgRoot,interval,reads)
    {
    this.interval = interval;
    
    this.featureWidth=  this.drawinAreaWidth/this.interval.distance(); 
    this.featureHeight= Math.min(Math.max(5.0,this.featureWidth),30); 
    this.HEIGHT_RULER= (""+this.interval.end).length*this.featureHeight+5;
			
    var coverage={};
    var consensus={};
    var defsNode = SVG.createDefs();
    svgRoot.appendChild(defsNode);
    svgRoot.setAttribute("width",this.drawinAreaWidth);
    
    //bases
    var acidNucleics = ["a","A","t","T","g","G","c","C","n","N"];
    for(var i in acidNucleics)
	    {
	    var factor=0.8;
	    var fontSize= this.y_h95()*factor;
	    var base= acidNucleics[i];
	    var path = SVG.createPath();
	    defsNode.appendChild(path);
	
	    path.setAttribute("id","b"+base);
	    path.setAttribute("title",base);
	    path.setAttribute("class","b"+base.toUpperCase());
	    path.setAttribute("d",this.hershey.svgPath(
			    base,
			    this.mid_y()+fontSize/2.0,
			    this.mid_y()-fontSize/2.0,
			    fontSize,
			    fontSize
			    ));
	    }
    
    var pastels=["fff8dc", "cd5c5c", "708090", "ff4500", "4682b4", "ffa500", "d8bfd8", "fa8072", "00ffff", "3cb371", "000000", "1e90ff", "cd853f", "4169e1", "f0ffff", "5f9ea0", "eeeee0", "a020f0", "bc8f8f", "ff69b4", "00ff7f", "000080", "e9967a", "daa520", "32cd32", "ee82ee", "7b68ee", "ffffe0", "8b8378", "db7093", "a0522d", "ffe4b5", "9370db", "afeeee", "eee5de", "8fbc8f", "8b8682", "8470ff", "8b8b83", "ff1493", "eedfcc", "f0f8ff", "ff6347", "faebd7", "add8e6", "fffafa", "c1cdc1", "cdc0b0", "c71585", "7fffd4", "7fff00", "cdaf95", "e0eee0", "556b2f", "dcdcdc", "ffebcd", "cdc8b1", "fff0f5", "ffe4e1", "9acd32", "ffc0cb", "8b8989", "ffff00", "cdb79e", "f5f5f5", "2f4f4f", "eee9e9", "cdcdc1", "eee8aa", "bebebe", "ffffff", "2e8b57", "fffff0", "b0e0e6", "fff5ee", "778899", "fffacd", "191970", "d2691e", "eecbad", "40e0d0", "ffd700", "eed5b7", "fffaf0", "ffefd5", "98fb98", "b22222", "87ceeb", "483d8b", "adff2f", "b8860b", "66cdaa", "f5fffa", "ff8c00", "00fa9a", "f4a460", "dda0dd", "fafad2", "f5f5dc", "9400d3", "006400", "cdc5bf", "a52a2a", "8b7d6b", "0000ff", "d02090", "ffb6c1", "48d1cc", "e0ffff", "f8f8ff", "d2b48c", "00ced1", "8b8878", "0000cd", "e6e6fa", "f0e68c", "6495ed", "f0fff0", "ffe4c4", "ff7f50", "d3d3d3", "00bfff", "b03060", "6a5acd", "ffa07a", "8b7765", "20b2aa", "ff0000", "f5deb3", "eee8dc", "ba55d3", "faf0e6", "6b8e23", "8a2be2", "7cfc00", "ffdab9", "8b4513", "87cefa", "cdc9c9", "9932cc", "deb887", "eedd82", "228b22", "838b83", "b0c4de", "f08080", "696969", "ffdead", "da70d6", "bdb76b", "fdf5e6"];
    var flags = [65,73,81,83,97,99,113,121,129,137,145,147,161,163,177,185,321,323,329,337,339,353,355,369,371,377,385,387,393,401,403,417,419,433,435,1089,1097,1105,1107,1121,1123,1137,1145,1153,1161,1169,1171,1185,1187,1201,1209];
    for(var flag=0;flag< flags.length;++flag)
	    {
	    defsNode.appendChild(SVG.createVGradient(
		      "f"+flags[flag],
			"stop-color:#"+pastels[flag%pastels.length]+";stop-opacity:1;",
			"stop-color:white;stop-opacity:1;"
		      ));
	    }
    
    
    var styleNode = SVG.createStyle();
    svgRoot.appendChild(styleNode);
    styleNode.appendChild(SVG.dom().createTextNode(this.getCss()));
    
    var rows=[];
    var y=0;
    for(var i=0; i< reads.length;++i)
      {
      var xyrecord = new  SamXY(this,reads[i]);
      for(var j=0;j< rows.length;++j)
	{
	var row = rows[j];
        var last = row[ row.length -1 ];
        if( this.baseToPixel( last.getEnd() ) +5 >=  this.baseToPixel( xyrecord.getStart() ) ) continue;
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
	gread.setAttribute("title", xyrecord.record.getReadName());
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
			      if(!this.showClipping)
				      {
				      readPos+=ce.getLength();
				      refPos+=ce.getLength();
				      break;
				      }
			      in_clip=true;
			      break;
			      }
			case 'M':
			case 'X':
			case '=':
			      {
			      var match_start = refPos;
			      var match_end = refPos + ce.getLength();
			      
			      //print sam background
			      var sb= "";
			      if(xyrecord.record.getStrand()=='-' &&
				      match_start >= this.interval.start && 
				      match_start <= this.interval.end &&
				      cidx==arrow_cigar_index)
				      {
				      sb += (" M " + this.format(this.baseToPixel(match_start)+this.arrow_w()) + ',' + this.y_top5());
				      sb += (" h " + this.format(this.baseToPixel(this.trim(match_end))-this.baseToPixel(match_start)-this.arrow_w()));
				      sb += (" v " + this.format(this.y_h95()));
				      sb += (" h " + this.format(-(this.baseToPixel(this.trim(match_end))-this.baseToPixel(match_start)-this.arrow_w())));
				      sb += (" L " + this.format(this.baseToPixel(match_start)) + ',' + this.mid_y());
				      sb += (" Z");
				      }
			      else if(xyrecord.record.getStrand()=='+' &&
					      match_end >= this.interval.start && 
					      match_end <= this.interval.end &&
					      cidx==arrow_cigar_index
					      )
				      {
				      sb += (" M " + this.format(this.baseToPixel(match_end)-this.arrow_w()) + ',' + this.y_top5());
				      sb += (" h " + this.format(-(this.baseToPixel(match_end)-this.baseToPixel(this.trim(match_start))-this.arrow_w())));
				      sb += (" v " + this.format(this.y_h95()));
				      sb += (" h " + this.format(this.baseToPixel(match_end)-this.baseToPixel(this.trim(match_start))-this.arrow_w()));
				      sb += (" L " + this.format(this.baseToPixel(match_end)) + ',' + this.mid_y() );
				      sb += (" Z");
				      }
			      else
				      {
				      sb += (" M " + this.format(this.baseToPixel(this.trim(match_start))) + ',' + this.y_top5() );
				      sb += (" h " + this.format(this.baseToPixel(this.trim(match_end))-this.baseToPixel(this.trim(match_start))));
				      sb += (" v " + this.format(this.y_h95()));
				      sb += (" h " + this.format(-(this.baseToPixel(this.trim(match_end))-this.baseToPixel(this.trim(match_start)))));
				      sb += (" Z");
				      }
			      var p= SVG.createPath();
			      gread.appendChild(p);
			      p.setAttribute("d",sb);
			      p.setAttribute("class","c");
			      if( op.isClip())
				      {
				      p.setAttribute("style","fill:yellow;");
				      }
			      else
				      {
				      p.setAttribute("style","fill:url(#f"+xyrecord.record.getFlag()+");");
				      }
			      
			      if(op.isConsumesReadBases())
				      {
				      for(var i=0;i< ce.getLength();++i)
					      {
					      if( this.interval.contains(refPos+i) && op.isConsumesReferenceBases() )
						{
						if( !( (refPos+i) in coverage) ) coverage[ refPos+i]=0;
						coverage[ refPos+i]++;
						}
						
					      var ca= xyrecord.record.charAt(readPos);
					      if(!in_clip)
						      {
						      /*
						      var count= consensus[""+refPos+i] ;
						      if(count==null)
							      {
							      count=new Counter<>();
							      consensus.put(refPos+i,count) ;
							      }
						      count.incr(ca);*/ //TODO
						      }
					      var cb='N';
					      var genomicSequence=null;//TODO
					      if(genomicSequence!=null)
						      {
						      cb= genomicSequence.charAt(refPos+i-1).toUpperCase();
						      }
					      
					      if(cb!='N' && ca!='N' && cb!=ca && !in_clip)
						      {
						      var u = SVG.createUse();
						      gread.appendChild(u);
						      u.setAttribute("x",this.format( this.baseToPixel(refPos+i)));
						      //w.writeAttribute("y",format(y_top));never needed
						      u.setAttribute("xlink",XLINK.NS,"href", "#mut");
						      }
					      
					      if(this.interval.contains(refPos+i) && 
						      this.featureWidth >  5)
						      {
						      //int qual = qualities[readPos];
						      var u = SVG.createUse();
					              gread.appendChild(u);
						      u.setAttribute("x",this.format( this.baseToPixel(refPos+i)));
						      //w.writeAttribute("y",format(y_top));never needed
						      u.setAttributeNS(XLINK.NS,"xlink:href", "#b"+ca);
						      }
					      readPos++;
					      }
				      }
			      refPos+=ce.getLength();
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
    
    

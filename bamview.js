
function BamView()
	{
	/** number of columns */
	this.ncols=80;
	this._cleanup();
	}

BamView.prototype._cleanup=function()
	{
	this.reads=null;
	this.reference=null;
	this.rows=new Array();
	this.refpos2insertsize={};
	}

BamView.prototype.pileup=function()
	{
	/* sort reads on position */
	this.reads.sort(function(a,b){return a.pos-b.pos});
	/* init y=0 */
	for(var i in this.reads)
		{
		this.reads[i].y=0;
		}
	/* y axis */
	var y=0;
	/* find a row where we can insert the read */
	for(var i in this.reads)
		{
		var read=this.reads[i];
		for(var y in this.rows)
			{
			var last=this.rows[y][ this.rows[y].length-1 ];
			/* no overlap with last of the row ?*/
			if(last.getAlignmentEnd()+1 < read.getAlignmentStart())
				{
				/* insert here */
				this.rows[y].push(read);
				read.y=y;
				read=null;
				break;
				}
			}
		/* create a new row */
		if(read!=null)
			{
			read.y=this.rows.length;
			var newrow=new Array();
			newrow.push(read);
			this.rows.push(newrow);
			}
		}
	}


BamView.prototype.draw=function(id,aln)
	{
	this.reads=aln.reads;
	this.reference=aln.reference;
	var div=document.getElementById(id);
	if(div==null) throw "cannot get element @id=\""+id+"\"";
	/* pileup */
	this.pileup();
	//remove all children
	while(div.firstChild!=null) div.removeChild(div.firstChild);
	
	var pre=document.createElement("div");
	pre.setAttribute("class","align");
	div.appendChild(pre);
	
	/* find inserts in reads */
	for(var i=0;i< this.reads.length;++i)
		{
		var read=this.reads[i];
		var iter=new CigarIterator(this.reference,read);
		var align;
		var prev_letter=null;
		while((align=iter.next())!=null)
			{
			if(prev_letter!=null && prev_letter==align.cigarElement.letter())
				{
				continue;
				}
			prev_letter=align.cigarElement.letter();
			switch(align.cigarElement.letter())
				{
				case 'I' : //cont
				case 'S' :
					{
					var posStr=""+align.refIndex;
					if( !(posStr in this.refpos2insertsize) ||
						this.refpos2insertsize[posStr] <  align.cigarElement.size()
						)
						{
						this.refpos2insertsize[posStr]=align.cigarElement.size();
						console.log(" "+read.y+" "+read.sequence+" "+align.cigarElement.size());
						}
					break;
					}
				default:break;
				}
			}	
		}
	
	
	var content="";
	/* write positions */
	var refPos=aln.reference.pos;
	var pixel_x=0;
	while(pixel_x< this.ncols)
		{
		if(refPos%10==0)
			{
			var fmt=""+refPos;
			for(var i=0;i<fmt.length;i++)
				{
				content+=fmt[i];
				refPos++;
				pixel_x++;
				}
			}
		else
			{
			content+=" ";
			refPos++;
			pixel_x++;
			}
		}
	content+="\n";
	
	/* write reference sequence */
	refPos=aln.reference.pos;
	pixel_x=0;
	while(pixel_x< this.ncols)
		{
		var posStr=""+refPos;
		if(posStr in  this.refpos2insertsize)
			{
			var extra=this.refpos2insertsize[posStr];
			while(extra>0 && pixel_x< this.ncols)
				{
				content+="*";
				pixel_x++;
				extra--;
				}
			if(pixel_x>= this.ncols) break;
			}
		content+=this.reference.get(refPos);
		refPos++;
		pixel_x++;
		}
	content+="\n";
	
	for(var y=0;y< this.rows.length;++y)
		{
		
		for(var x=0;x<100;++x)
			{
			var gpos=this.reference.pos+x;
			
			var pixel=" ";
			for(var j in this.rows[y])
				{
				
				var read=this.rows[y][j];

				var iter=new CigarIterator(this.reference,read);
				var align;
				while((align=iter.next())!=null)
					{
					if(align.refIndex!=gpos) continue;
					pixel=align.readBase;
					
					break;
					}
				if(pixel!=" ") break;
				}
			if(pixel!=null) content+=pixel;
			}
		content+="\n";
		}
	
	pre.appendChild(document.createTextNode(content));
	
	/* we're done */
	this._cleanup();
	}

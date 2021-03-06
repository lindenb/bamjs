/**

Author: Pierre Lindenbaum PhD
	@yokofakun 
        http://plindenbaum.blogspot.com

Date:   2015

WWW:    https://github.com/lindenb/bamjs

Javascript library for SAM/BAM. Inspired from the picard library for SAM.

 **/

/** The operators that can appear in a cigar string */
function CigarOperator(consumesReadBases,  consumesReferenceBases, c)
	{
	this.consumesReadBases=consumesReadBases;
	this.consumesReferenceBases=consumesReferenceBases;
	this.letter=c;
	}

CigarOperator.prototype.isConsumesReferenceBases=function()
	{
	return this.consumesReferenceBases;
	}


CigarOperator.prototype.isConsumesReadBases=function()
	{
	return this.consumesReadBases;
	}

CigarOperator.prototype.toString=function()
	{
	return this.letter;
	}



/** Match or mismatch */
CigarOperator.M = new CigarOperator(true, true,   'M');
/** Insertion vs. the reference. */
CigarOperator.I = new CigarOperator(true, false,  'I');
/** Deletion vs. the reference. */
CigarOperator.D = new CigarOperator(false, true,  'D');
/** Skipped region from the reference. */
CigarOperator.N = new CigarOperator(false, true,  'N');
/** Soft clip. */
CigarOperator.S = new CigarOperator(true, false,  'S');
/** Hard clip. */
CigarOperator.H = new CigarOperator(false, false, 'H');
/** Padding. */
CigarOperator.P = new CigarOperator(false, false, 'P');
/** Matches the reference. */
CigarOperator.EQ = new CigarOperator(true, true,  '=');
/** Mismatches the reference. */
CigarOperator.X = new CigarOperator(true, true,   'X');


CigarOperator.getByName=function(op)
	{
        switch (op)
        	{
        	case 'M': return CigarOperator.M;
        	case 'I': return CigarOperator.I;
        	case 'D': return CigarOperator.D;
        	case 'N': return CigarOperator.N;
        	case 'S': return CigarOperator.S;
        	case 'H': return CigarOperator.H;
        	case 'P': return CigarOperator.P;
        	case '=': return CigarOperator.EQ;
        	case 'X': return CigarOperator.X;
		default: throw ("Unrecognized CigarOperator: " + op);
        	}
    	}
CigarOperator.prototype.isClip = function() {
return this.letter == "H" || this.letter == "S" ;
}

CigarOperator.prototype.name = function() {
return this.letter == "=" ?"EQ":this.letter ;
}

/****************************************************************************************************************************/
/****************************************************************************************************************************/
/****************************************************************************************************************************/

/*  One component of a cigar string. */
function CigarElement(length,op)
	{
	this.length=length;
	this.op=op;
	}
/** return the length part of this cigar element */
CigarElement.prototype.size=function()
	{
	return this.length;
	}
/** alias of size */
CigarElement.prototype.getLength=function()
	{
	return this.size();
	}

/** shotcuts to get the character of the operator */
CigarElement.prototype.getOperator=function()
	{
	return this.op;
	}	
	
/** shotcuts to get the character of the operator */
CigarElement.prototype.letter=function()
	{
	return this.op.letter;
	}

	
	
CigarElement.prototype.toString=function()
	{
	return ""+this.size()+this.letter();
	}

/** return true if operator is 'I' or 'S' */
CigarElement.prototype.isInsertionInRead=function()
	{
	switch(this.letter())
		{
		case 'I' : //cont
		case 'S' :
			{
			return true;
			}
		default: return false;
		}
	}

/** return true if operator is 'N' or 'D' */
CigarElement.prototype.isDeletionInRead=function()
	{
	switch(this.letter())
		{
		case 'N' : //cont
		case 'D' :
			{
			return true;
			}
		default: return false;
		}
	}

/** return true if operator is 'X','=' or 'M' */
CigarElement.prototype.isAligned=function()
	{
	switch(this.letter())
		{
		case 'X' : //cont
		case '=' : //cont
		case 'M' :
			{
			return true;
			}
		default: return false;
		}
	}



/** return true two cigar elements have the same operator and size */
CigarElement.prototype.sameAs=function(other)
	{
	if( other==null) return false;
	return other.letter()==this.letter() &&
		other.size()==this.size()
		;
	}

/****************************************************************************************************************************/
/****************************************************************************************************************************/
/****************************************************************************************************************************/

/** A list of CigarElements, which describes how a read aligns with the reference. */
function Cigar()
	{
	this.cigarElements = [];
	}

Cigar.prototype.size=function()
	{
	return this.cigarElements.length;
	}

Cigar.prototype.get=function(index)
	{
	return this.cigarElements[index];
	}


Cigar.prototype.getReferenceLength=function()
	{
        var length = 0;
        for(var i=0;i< this.size();++i)
            {
            var elt=this.get(i);
            if(elt.op.isConsumesReferenceBases())  length += elt.length;
            }
        return length;
    	}


Cigar.prototype.getReadLength=function()
	{
        var length = 0;
        for(var i=0;i< this.size();++i)
            {
            var elt=this.get(i);
            if(elt.op.isConsumesReadBases())  length += elt.length;
            }
        
        return length;
    	}
    	
/** convert this cigar to String */
Cigar.prototype.toString=function()
	{
	var s="";
	for(var i=0;i< this.size();++i) s+=this.get(i).toString();
	return s;
	}

/** static function parsing a cigar from a string */
Cigar.parse=function(cigarStr)
	{
	var cigar =  new Cigar();
	var i=0;
	while(i< cigarStr.length)
		{
		var length=0;
		while(cigarStr.charCodeAt(i)>=48 && cigarStr.charCodeAt(i)<58)
			{
			length=length*10+(cigarStr.charCodeAt(i)-48);
			++i;
			}
		if(length==0) throw "length=0 in cigarString: \""+cigarStr+"\"";
		var op=CigarOperator.getByName(cigarStr[i++]);
		cigar.cigarElements.push(new CigarElement(length,op));
		}
	return cigar;
	}
/****************************************************************************************************************************/
/****************************************************************************************************************************/
/****************************************************************************************************************************/

/** reference sequence, holds the name, the position of the first base and the DNA sequence */
function Reference(name,pos,sequence)
	{
	this.name=name;
	this.pos=pos;
	this.sequence=sequence;
	}

/** return the base from the genomic index */
Reference.prototype.get=function(index)
	{
	return (this.sequence != null &&
			index >=this.pos &&
			index-this.pos < this.sequence.length
		? this.sequence.substr(index-this.pos,1) : 'N'
		);
	}

/**  alias for get */
Reference.prototype.charAt=function(index)
	{
	return this.get(index);
	}

/**  get contig */
Reference.prototype.getContig = function()
	{
	return this.name;
	}
/****************************************************************************************************************************/
/****************************************************************************************************************************/
/****************************************************************************************************************************/

function SamFlag(flag,def) {
  this.flag = flag;
  this.def = def;
}
SamFlag.prototype.isSet = function(flg) { return ( flg & this.flag );}

SamFlag.PAIRED = new SamFlag(0x1,"Paired");
SamFlag.PROPER_PAIR = new SamFlag(0x2,"Proper Pair");
SamFlag.READ_UNMAPPED = new SamFlag(0x4,"Read Unmapped");

/****************************************************************************************************************************/
/****************************************************************************************************************************/
/****************************************************************************************************************************/

function SamSequenceRecord(name,length) {
  this.name = name;
  this.length = length;
}
/****************************************************************************************************************************/
/****************************************************************************************************************************/
/****************************************************************************************************************************/
function SamSequenceDictionary() {
  this.sequences = [];
  this.name2seq = {};
}

SamSequenceDictionary.prototype.getSequence = function(name) {
return this.name2seq[name];
}
SamSequenceDictionary.prototype.get = function(idx) {
return this.sequences[idx];
}
SamSequenceDictionary.prototype.size = function() {
return this.sequences.length;
}
SamSequenceDictionary.prototype.getGenomeSize = function() {
var n=0,i;
for(i=0;i< this.size();++i) n+= this.get(i).length;
return n;
}
SamSequenceDictionary.prototype.addSequence = function(seq) {
  this.name2seq[seq.name] = seq; 
  this.sequences.push(seq);
}
/****************************************************************************************************************************/
/****************************************************************************************************************************/
/****************************************************************************************************************************/
function SamFileHeader()
{
  this.dict = new SamSequenceDictionary();
}

/****************************************************************************************************************************/
/****************************************************************************************************************************/
/****************************************************************************************************************************/
function SamAttribute(s) {
var tokens=s.split(/\:/);
this.key = tokens[0];
this.type = tokens[1];
this.data = tokens[2];
}

SamAttribute.prototype.toString = function()
  {
  return this.key+":"+this.type+":"+this.data;
  }

/****************************************************************************************************************************/
/****************************************************************************************************************************/
/****************************************************************************************************************************/

/* function SamRecord(name,flag,pos,qual,cigarStr,sequence,qualities)
	{
	this.name=name;
	this.flag=flag;
	this.pos=pos;
	this.qual=qual;
	this.cigar=Cigar.parse(cigarStr);;
	this.sequence=sequence;
	this.qualities=qualities;
	this.attributes={};
	this.y=0;
	}*/
function SamRecord()
	{
	this.name="";
	this.flag=0;
	this.pos=0;
	this.qual=0;
	this.cigar=null;
	this.sequence="";
	this.qualities="";
	this.attributes={};
	this.y=0;
	}
SamRecord.UNKNOWN_MAPPING_QUALITY = 255;
SamRecord.NO_MAPPING_QUALITY = 0;
SamRecord.NO_ALIGNMENT_REFERENCE_NAME = "*";
SamRecord.NO_ALIGNMENT_REFERENCE_INDEX = -1;
SamRecord.NO_ALIGNMENT_CIGAR = "*";

/* @return 1-based inclusive leftmost position of the clippped sequence, or 0 if there is no position. */
SamRecord.prototype.setAlignmentStart = function(pos) { this.pos = pos;}
SamRecord.prototype.getAlignmentStart = function()
	{
	return this.pos;
	}


SamRecord.prototype.setReferenceName = function(contig) { this.contig = contig;}
SamRecord.prototype.getReferenceName = function() { return this.contig ;}

SamRecord.prototype.setReadName = function(name) { this.name = name;}
SamRecord.prototype.getReadName = function() { return this.name;}

/* return a Cigar object for this SamRecord */
SamRecord.prototype.getCigar = function() {return this.cigar;}
SamRecord.prototype.setCigar = function(cigar) { this.cigar = cigar;}

SamRecord.prototype.setFlag = function(flg) { this.flag = flg;}
SamRecord.prototype.getFlag = function() { return this.flag;}


SamRecord.prototype.setCigarString = function(cigarstr) { this.setCigar(Cigar.parse(cigarstr));}
SamRecord.prototype.getCigarString = function() { return this.getCigar().toString();}


SamRecord.prototype.setMappingQuality = function(mapq) { this.qual = mapq;}
SamRecord.prototype.getMappingQuality = function() { return this.qual;}

SamRecord.prototype.setReadString = function(seq) { this.sequence = seq;}
SamRecord.prototype.getReadString = function() { return this.sequence;}


SamRecord.prototype.setBaseQualityString = function(q) { this.qualities = q; }
SamRecord.prototype.getBaseQualityString = function() { return this.qualities; }


SamRecord.prototype.isFlagSet=function(flg)
	{
	return flg & this.flag;
	}

SamRecord.prototype.isPaired=function()
	{
	return this.isFlagSet(0x1);
	}
		
SamRecord.prototype.isPropertPair=function()
	{
	return this.isFlagSet(0x2);
	}
	

SamRecord.prototype.isUnmapped=function()
	{
	return this.isFlagSet(0x4);
	}
	

SamRecord.prototype.isMateUnmapped=function()
	{
	return this.isFlagSet(0x8);
	}

SamRecord.prototype.isReverseStrand=function()
	{
	return this.isFlagSet(0x10);
	}

SamRecord.prototype.getStrand = function() {
if( this.isUnmapped()) return null;
return( this.isReverseStrand() ? "-":"+" );
}

SamRecord.prototype.isMateReverseStrand=function()
	{
	return this.isFlagSet(0x20);
	}

SamRecord.prototype.isFirstInPair=function()
	{
	return this.isFlagSet(0x40);
	}

SamRecord.prototype.isSecondInPair=function()
	{
	return this.isFlagSet(0x80);
	}

SamRecord.prototype.isNotPrimaryAlignment=function()
	{
	return this.isFlagSet(0x100);
	}

SamRecord.prototype.isFailsVendor=function()
	{
	return this.isFlagSet(0x200);
	}
	
SamRecord.prototype.isPCRDuplicate=function()
	{
	return this.isFlagSet(0x400);
	}

/* returns the length of the DNA sequence */
SamRecord.prototype.size=function()
	{
	return this.sequence.length;
	}	

/* returns the idx-th base of the DNA sequence */
SamRecord.prototype.get=function(i)
	{
	if(i<0 || i>=this.size()) throw "index out of range 0<="+i+"<"+this.size();
	return this.sequence[i];
	}
/* alias for get */
SamRecord.prototype.charAt=function(i)
	{
	return this.get(i);
	}



SamRecord.prototype.getUnclippedStart = function() {
       var unClippedStart = this.getAlignmentStart();
        for(var i=0; i< this.cigar.size(); ++i) {
            var ce = this.cigar.get(i);
	    var op = ce.getOperator();
            if (op == CigarOperator.S || op == CigarOperator.H ) {
                unClippedStart -= ce.getLength();
            } else {
                break;
            }
        }
    return unClippedStart
    }	
	
/** @return 1-based inclusive rightmost position of the clippped sequence, or 0 read if unmapped. */
SamRecord.prototype.getAlignmentEnd=function()
	{
	var start=this.getAlignmentStart();
        if(start==0)  return 0;
       
        var end = start + this.getCigar().getReferenceLength() - 1;
     	
        return end;
    	}

SamRecord.prototype.getUnclippedEnd = function() {
        var unClippedEnd = this.getAlignmentEnd();
        for (var i = this.cigar.size() - 1; i >= 0; --i) {
            var cig = this.cigar.get(i);
            var op = cig.getOperator();
            if (op == CigarOperator.S || op == CigarOperator.H ) {
                unClippedEnd += cig.getLength();
            } else {
                break;
            }
        }
        return unClippedEnd;
 }

 SamRecord.prototype.toSamString = function() {
 var a = new Array();
 a.push( this.getReadName());
 a.push( this.getFlag());
 a.push( this.getReferenceName() );
 a.push( this.getAlignmentStart() );
 a.push( this.getMappingQuality());
 a.push( this.getCigarString() );
 return a.join('\t');  
}
 
 SamRecord.prototype.toString = function() {
 return this.toSamString();
}
 
SamRecord.prototype.addAttribute = function(att) {
 return this.attributes[att.key]=att;;
}
 
 
SamRecord.parse = function(line) {
   var tokens = line.split(/\t/);
   var rec = new SamRecord();
   rec.setReadName(tokens[0]);
   rec.setFlag(parseInt(tokens[1]));
   rec.setReferenceName(tokens[2]);
   rec.setAlignmentStart(parseInt(tokens[3]));
   rec.setMappingQuality(parseInt(tokens[4]));
   rec.setCigarString(tokens[5]);
   //rec.setMateReference(tokens[6]);
   //rec.setMateAlignmentEnd(parseInt(tokens[7]);
   //rec.setDistanceSize(parseInt(tokens[8]));
   rec.setReadString(tokens[9]);
   rec.setBaseQualityString(tokens[10]);
   for(var i=11;i< tokens.length;++i)
    {
      rec.addAttribute( new SamAttribute(tokens[i]) );
    } 
   return rec;
}

/****************************************************************************************************************************/
/****************************************************************************************************************************/
/****************************************************************************************************************************/
function Pairwise()
	{
	this.readIndex=-1;
	this.refIndex=-1;
	this.readBase=null;
	this.refBase=null;
	this.cigarElement=null;
	}

/* returns true if is an InsertionInRead */
Pairwise.prototype.isInsertionInRead=function()
	{
	return this.cigarElement.isInsertionInRead();
	}

/* returns true if is a Deletion In Read */
Pairwise.prototype.isDeletionInRead=function()
	{
	return this.cigarElement.isDeletionInRead();
	}
	
/* returns true if read under reference */
Pairwise.prototype.isAligned=function()
	{
	return this.cigarElement.isAligned();
	}

Pairwise.prototype.toString=function()
	{
	if(this.isAligned())
		{
		return "read:"+this.readIndex+"/ref"+this.refIndex;
		}
	else if(this.isInsertionInRead())
		{
		return "insert:read:"+this.readIndex;
		}
	else if(this.isDeletionInRead())
		{
		return "deletion:ref:"+this.refIndex;
		}
	return "WTF!";
	}

/****************************************************************************************************************************/
/****************************************************************************************************************************/
/****************************************************************************************************************************/

function CigarIterator(ref,samRec)
	{
	this.ref=ref;
	this.samRec=samRec;
	this.cigar=samRec.getCigar();
	this.cigarElementIndex=0;
	this.indexInCigarElement=-1;
	this.readIndex = 0;
	this.refIndex = samRec.getAlignmentStart();
	}

/**
 * create a javascript object describing the alignment, called by 'next()'
 */
CigarIterator.prototype._align=function()
	{
	var ret=  new Pairwise();
	ret.readIndex=this.readIndex;
	ret.refIndex=this.refIndex;
	ret.readBase=null;
	ret.refBase=null;
	ret.cigarElement=this.cigar.get( this.cigarElementIndex );
	return ret;
	}

/**
 *
 * @returns
 *    returns null at end
 */
CigarIterator.prototype.next=function()
	{
	for(;;)
		{
		
		if(this.cigarElementIndex >= this.cigar.size()) return null;
		var ce= this.cigar.get( this.cigarElementIndex );
		
		this.indexInCigarElement++;
		
		if(this.indexInCigarElement < ce.size())
			{
			switch(ce.letter())
				{
				case 'H' : break; // ignore hard clips
				case 'P' : break; // ignore pads
				case 'I' : //cont
				case 'S' :
					{
					var ret=  this._align();
					ret.readBase= this.samRec.get(this.readIndex);
					this.readIndex++;
					return ret;
					};
				case 'N' : //cont
				case 'D' :
					{
					var ret=  this._align();
					this.refIndex++;
					return ret;
					};
				case 'X'://cont
				case '='://cont
				case 'M':
					{
					var ret=  this._align();
					ret.readBase= this.samRec.get(this.readIndex);
					this.readIndex++;
					this.refIndex++;
					return ret;
					}
				default: throw "Not handled: "+ce.op;
				}
			
			}
		this.cigarElementIndex++;
		this.indexInCigarElement=-1;
		}
	}


	
	

function Interval(contig,start,end) {
  this.contig = contig;
  this.start = start;
  this.end = end;
}

Interval.prototype.getContig = function() { return this.contig;}
Interval.prototype.getStart = function() { return this.start;}
Interval.prototype.getEnd = function() { return this.end;}

Interval.prototype.distance = function()
	{
	return 1+ this.getEnd()-this.getStart();
	}
Interval.prototype.toString = function() {
	return this.getContig()+":"+this.getStart()+"-"+this.getEnd();
	}
Interval.prototype.contains = function(pos)
	{
	return this.start<=pos && pos<=this.end;
	}

Interval.parse = function(s)
	{
	var colon=s.indexOf(':');
	if(colon<1)
		{
		return null;
		}
	var chrom = s.substr(0,colon);
	var start = 0;
	var end = 0;
	s = s.substr(colon+1);
	var hyphen= s.indexOf('-');
	if( hyphen == -1 )
		{
		start = parseInt(s.replace(/[,]/g, '') );
		end = start;
		}
	else
		{
		start = parseInt( s.substr(0,hyphen).replace(/[,]/g, '') );
		end = parseInt( s.substr(hyphen+1).replace(/[,]/g, '') );
		}
	
	if(chrom.length==0 || isNaN(start) || start <0  || isNaN(end) || end < start)
		{
		return null;
		}
	return new Interval(chrom,start,end);
	}


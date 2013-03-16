/**

Author: Pierre Lindenbaum PhD
	@yokofakun 
        http://plindenbaum.blogspot.com

Date:   2013

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
CigarOperator.M=new CigarOperator(true, true,   'M');
/** Insertion vs. the reference. */
CigarOperator.I=new CigarOperator(true, false,  'I');
/** Deletion vs. the reference. */
CigarOperator.D=new CigarOperator(false, true,  'D');
/** Skipped region from the reference. */
CigarOperator.N=new CigarOperator(false, true,  'N');
/** Soft clip. */
CigarOperator.S=new CigarOperator(true, false,  'S');
/** Hard clip. */
CigarOperator.H=new CigarOperator(false, false, 'H');
/** Padding. */
CigarOperator.P=new CigarOperator(false, false, 'P');
/** Matches the reference. */
CigarOperator.EQ=new CigarOperator(true, true,  '=');
/** Mismatches the reference. */
CigarOperator.X=new CigarOperator(true, true,   'X');



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
            	throw ("Unrecognized CigarOperator: " + op);
        	}
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
/** return true two cigar elements have the same operator and size */
CigarElement.prototype.sameAs(other)
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
function Cigar(cigarElements)
	{
	this.cigarElements=cigarElements;
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
	var elts = new Array();
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
		elts.push(new CigarElement(length,op));
		}
	return new Cigar(elts);
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
	return (this.sequence != undefined &&
			index >=this.pos &&
			index-this.pos < this.sequence.length
		? this.sequence.substr(index-this.pos,1) : 'N'
		);
	}

/****************************************************************************************************************************/
/****************************************************************************************************************************/
/****************************************************************************************************************************/
function SamRecord(name,flag,pos,qual,cigarStr,sequence,qualities)
	{
	this.name=name;
	this.flag=flag;
	this.pos=pos;
	this.qual=qual;
	this.cigar=Cigar.parse(cigarStr);;
	this.sequence=sequence;
	this.qualities=qualities;
	this.y=0;
	}

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


/* return a Cigar object for this SamRecord */
SamRecord.prototype.getCigar=function()
	{
	return this.cigar;
	}

/* @return 1-based inclusive leftmost position of the clippped sequence, or 0 if there is no position. */
SamRecord.prototype.getAlignmentStart=function()
	{
	return this.pos;
	}
/** @return 1-based inclusive rightmost position of the clippped sequence, or 0 read if unmapped. */
SamRecord.prototype.getAlignmentEnd=function()
	{
	var start=this.getAlignmentStart();
        if(start==0)  return 0;
       
        var end = start + this.getCigar().getReferenceLength() - 1;
     	
        return end;
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
	var ret=  {
		"readIndex":this.readIndex,
		"refIndex":this.refIndex,
		"readBase":null,
		"refBase":null,
		"cigarElement":this.cigar.get( this.cigarElementIndex )
		};
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




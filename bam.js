/** The operators that can appear in a cigar string */
function CigarOperator(consumesReadBases,  consumesReferenceBases, c)
	{
	this.consumesReadBases=consumesReadBases;
	this.consumesReferenceBases=consumesReferenceBases;
	this.c=c;
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
	return this.c;
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

CigarElement.prototype.toString=function()
	{
	return ""+this.length+this.op.toString();
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
	var s=0;
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
		while(cigarStr.charCodeAt(i)>47 && cigarStr.charCodeAt(i)<58)
			{
			length=length*10+(cigarStr.charCodeAt(i)-47);
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
function SamRecord(name,flag,pos,qual,cigar,sequence,qualities)
	{
	this.name=name;
	this.flag=flag;
	this.pos=pos;
	this.qual=qual;
	this.cigar=cigar;
	this.sequence=sequence;
	this.qualities=qualities;
	this.y=0;
	}

SamRecord.prototype.flagIsSet=function(flg)
	{
	return flg & this.flag;
	}

SamRecord.prototype.isPaired=function()
	{
	return this.hasFlag(0x1);
	}
		
SamRecord.prototype.isPropertPair=function()
	{
	return this.hasFlag(0x2);
	}
	

SamRecord.prototype.isUnmapped=function()
	{
	return this.hasFlag(0x4);
	}
	

SamRecord.prototype.isMateUnmapped=function()
	{
	return this.hasFlag(0x8);
	}

SamRecord.prototype.isReverseStrand=function()
	{
	return this.hasFlag(0x10);
	}

SamRecord.prototype.isMateReverseStrand=function()
	{
	return this.hasFlag(0x20);
	}

SamRecord.prototype.isFirstInPair=function()
	{
	return this.hasFlag(0x40);
	}

SamRecord.prototype.isSecondInPair=function()
	{
	return this.hasFlag(0x80);
	}

SamRecord.prototype.isNotPrimaryAlignment=function()
	{
	return this.hasFlag(0x100);
	}

SamRecord.prototype.isFailsVendor=function()
	{
	return this.hasFlag(0x200);
	}
	
SamRecord.prototype.isPCRDuplicate=function()
	{
	return this.hasFlag(0x400);
	}

/* returns the length of the DNA sequence */
SamRecord.prototype.size=function()
	{
	return this.sequence.length;
	}	

/* returns the idx-th base of the DNA sequence */
SamRecord.prototype.get=function(i)
	{
	return this.sequence[i];
	}

/* returns this as a FASTQ record */
SamRecord.prototype.toFastQ=function()
	{
	return "@"+this.name+"\n"+this.sequence+"\n+\n"+this.qualities;
	}	
/****************************************************************************************************************************/
/****************************************************************************************************************************/
/****************************************************************************************************************************/
function CigarIterator(ref,samRec)
	{
	this.ref=ref;
	this.samRec;
	this.cigar=Cigar.parse(samRec.cigar);
	this.cigarElementIndex=-1;
	}


/****************************************************************************************************************************/
/****************************************************************************************************************************/
/****************************************************************************************************************************/


function BamView() {}
BamView.draw=function(id,aln)
	{
	var reads=aln.reads;
	/* sort reads on position */
	reads.sort(function(a,b){return a.pos-b.pos});
	for(i in reads)
		{
		reads[i].y=0;
		Cigar.parse(reads[i].cigar);
		}
	}

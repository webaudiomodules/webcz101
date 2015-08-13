(function(NS) {
NS.SysEx = function (sx)
{
	this.data = sx;
	this.model = this.models[sx.byteLength];
	if (this.model)
	{
		this.type = (sx.byteLength <= 296) ? "patch" : "bank";
		this.numPatches = (this.type == "patch") ? 1 : this.numPatches[this.model];
	}
	else { this.type = "unknown"; this.numPatches = 0; }
}

NS.SysEx.prototype =
{
	models : { 264:"cz101", 296:"cz1", 4224:"cz101", 8448:"cz3000", 18944:"cz1", 22016:"cz1" },
	numPatches : { cz101:16, cz3000:32, cz1:64 },
	
	parse: function (sx)
	{
		var czbyte = function (d,o) { return d[o] + (d[o+1]<<4); };
		var clamp = function (v,min,max) { if (v < min) v = min; if (v > max) v = max; return v; };
		var vibwave = [-1, 0x02, 0x08, 0x20, 0x04];
		
		function getModulation(d)
		{
			var mod = ((czbyte(d,30) & 0x38) >> 3) & 7;
			if (mod & 2) mod = 1;			// ring
			else if (mod & 1) mod = 2;		// noise
			else mod = 0;						// off
			return mod;
		};
		
		// not right ?
		function getDetuneFine(d)
		{
			var b = czbyte(d,4);
			return (b/4 - b/51)|0;
		};
		
		function getWave(d, o, dual)
		{
			var shift = dual ? 0 : 3;
			var wave = ((czbyte(d,o) << shift) & 0xE0) >> 5;
			if (wave & 3 == 3) wave = 0;
			if (wave > 3) wave -= 1;
			if (wave > 4)
				wave += (czbyte(d,o+2) & 0xC0) >> 6;
			return wave;
		};
		
		function getEG(block, eg, d, o)
		{
			eg.end = clamp((czbyte(d,o) & 0x0F), 0,7) - 1;
			eg.sustain = 0;
			for (var i=0; i<8; i++)
			{
				var ir = 4*i + 2;
				var il = ir + 2;
				var R = (czbyte(d, o+ir) & 0x7F);
				if (R > 0)
				{
					if (block == "dca") R = clamp((R*99/119 + 1)|0 , 1,99);
					else if (block == "dcw") R = clamp(((R-8)*99/119 + 1)|0, 0,99);
					else R = clamp((R*99/127 + 1)|0 , 1,99);
				}				
				if (i < 7)
				{
					var b = czbyte(d, o+il);
					var L = b & 0x7F;
					if (block == "dca") L = clamp(L-28, 0,99);
					else if (block == "dcw" && L > 0) L = clamp((L*99/127 + 1)|0, 0,99);
					else if (L >= 0x40) L -= 4;
					if (eg.sustain == 0 && (b & 0x80)) eg.sustain = i+1;
				}
				eg.rate[i]  = R;
				eg.level[i] = L;
			}
		}
		
		/* function getName(d,o)
		{
			var name = "";
			for (var i=o; i<o+32; i+=2)
				name += String.fromCharCode(czbyte(d,i));
			return name;
		} */
		
		var p = new NS.Patch();		
		var d = sx.subarray(7, 263);

		p.line.out		 = czbyte(d,0) & 3;
		p.mod				 = getModulation(d);
		p.octave			 = clamp(czbyte(d,0) >> 2, 0,2);
		p.detune.dir	 = czbyte(d,2) & 1;
		p.detune.fine	 = getDetuneFine(d);
		p.detune.oct	 = (czbyte(d,6) / 12) | 0;
		p.detune.note	 = (czbyte(d,6) % 12) | 0;
		p.vibrato.wave	 = clamp(vibwave.indexOf(czbyte(d,8)), 1,4);
		p.vibrato.delay = czbyte(d,10);
		p.vibrato.rate  = czbyte(d,16);
		p.vibrato.depth = czbyte(d,22);
		if (p.octave == 2) p.octave = -1;

		for (var L=0; L<=1; L++)
		{
			var line = p.line[L];
			var o = L*114;	// offset to line2

			line.dco.wave1 = getWave(d,28+o, false);
			line.dco.wave2on = (czbyte(d,28+o) & 2) != 0;
			if (line.dco.wave2on) line.dco.wave2 = getWave(d,28+o, true);
			else						 line.dco.wave2 = line.dco.wave1;				
			line.dca.keyfollow = czbyte(d,32+o) & 3;
			line.dcw.keyfollow = czbyte(d,36+o);
			getEG("dca", line.dca, d, 40+o);
			getEG("dcw", line.dcw, d, 74+o);
			getEG("dco", line.dco, d, 108+o);
		}
			
		// var name = getName(d, 256);
		// console.log(name);
		
		return p;
	}
};
}(WAM.Synths.webCZ101));

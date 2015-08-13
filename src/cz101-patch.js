(function(NS) {
NS.Patch = function ()
{
	// -- initialized patch
	// -- see CZ101 operation manual p.36
	this.vibrato = { wave:1, delay:0, rate:0, depth:0 };
	this.octave = 0;
	this.line = [
		{ dco: { wave1:1, wave2:0, wave2on:0, sustain:0, end:7,
					rate:[50,50,50,50,50,50,50,50], level:[0,0,0,0,0,0,0,0] },
		  dcw: { keyfollow:0, sustain:0, end:7,
					rate:[99,50,50,50,50,50,50,50], level:[99,0,0,0,0,0,0,0] },
		  dca: { keyfollow:0, sustain:0, end:7,
					rate:[99,50,50,50,50,50,50,50], level:[99,0,0,0,0,0,0,0] }},
		{ dco: { wave1:1, wave2:0, sustain:0, end:7,
					rate:[50,50,50,50,50,50,50,50], level:[0,0,0,0,0,0,0,0] },
		  dcw: { keyfollow:0, sustain:0, end:7,
					rate:[99,50,50,50,50,50,50,50], level:[99,0,0,0,0,0,0,0] },
		  dca: { keyfollow:0, sustain:0, end:7,
					rate:[99,50,50,50,50,50,50,50], level:[99,0,0,0,0,0,0,0] }}];
	this.detune = { oct:0, note:0, fine: 0, dir:0 };
	this.name = "INIT";
	this.line.out = 0;
	this.mod = 0;
	
	this.clone = function()
	{
		var clone = new NS.Patch();
		clone.vibrato	= JSON.parse(JSON.stringify(this.vibrato));
		clone.line		= JSON.parse(JSON.stringify(this.line));
		clone.detune	= JSON.parse(JSON.stringify(this.detune));
		clone.octave	= this.octave;
		clone.name		= this.name;
		clone.line.out = this.line.out;
		clone.syx		= this.syx;
		return clone;
	}

	this.toArray = function ()
	{
		var i = 0;
		var a = new Uint8Array(121*2+2);
		function push(id,value) { a[i] = id; a[i+1] = value; i+=2; }
		
		// -- version
		push(0,1);
		
		// -- common (11)
		push(3, this.octave);
		push(21, this.line.out);
		push(22, this.detune.dir);
		push(23, this.detune.oct);
		push(24, this.detune.note);
		push(25, this.detune.fine);
		push(26, this.mod);
		push(176, this.vibrato.rate);
		push(180, this.vibrato.wave);
		push(181, this.vibrato.delay);
		push(182, this.vibrato.depth);
		
		// -- dco (2+2+7+8 = 19*2 = 38)
		push(15, this.line[0].dco.wave1);
		push(16, this.line[0].dco.wave2);
		push(17, this.line[1].dco.wave1);
		push(18, this.line[1].dco.wave2);		
		for (var l=0; l<=1; l++)
		{
			push(34 + l*24, this.line[l].dco.sustain);
			push(35 + l*24, this.line[l].dco.end);
			for (var j=0; j<7; j++)
				push(37 + j + l*24, this.line[l].dco.level[j]);
			for (var j=0; j<8; j++)
				push(44 + j + l*24, this.line[l].dco.rate[j]);
		}

		// -- dcw (3+7+8 = 18*2 = 36)
		for (var l=0; l<=1; l++)
		{
			push(78 + l*25, this.line[0].dcw.keyfollow);
			push(83 + l*25, this.line[l].dcw.sustain);
			push(84 + l*25, this.line[l].dcw.end);
			for (var j=0; j<7; j++)
				push(86 + j + l*25, this.line[l].dcw.level[j]);
			for (var j=0; j<8; j++)
				push(93 + j + l*25, this.line[l].dcw.rate[j]);
		}
		
		// -- dca (3+7+8 = 18*2 = 36)
		for (var l=0; l<=1; l++)
		{
			push(128 + l*25, this.line[0].dca.keyfollow);
			push(133 + l*25, this.line[l].dca.sustain);
			push(134 + l*25, this.line[l].dca.end);
			for (var j=0; j<7; j++)
				push(136 + j + l*25, this.line[l].dca.level[j]);
			for (var j=0; j<8; j++)
				push(143 + j + l*25, this.line[l].dca.rate[j]);
		}
		
		return a;
	}
	
	this.setParam = function (name, value)
	{
		if (!setCommonParam(this, name, value))
			setLineParam(this, name, value);
	}

	function setCommonParam(self, name, value)
	{
		switch (name)
		{
			case "wave":
			case "delay":
			case "rate":
			case "depth":
				self.vibrato[name] = value; break;
			case "detdir":
			case "detoct":
			case "detnote":
			case "detfine":
				self.detune[name] = value; break;
			case "octave": self.octave = value-1;	break;
			case "lineout": self.line.out = value;	break;
			case "mod": self.mod = value; break;
			case "solo":
			case "bend":
			case "portamento":
				return true;
			default: return false;
		}
		return true;
	}
	
	function setLineParam(self, name, value)
	{
		var line  = (name[3] | 0) - 1;
		var block = name.substr(0,3);
		name = name.substr(4);
		if (name.indexOf("rate") == 0 || name.indexOf("level") == 0)
		{
			var index = (name[name.length-1] | 0);
			name = name.substr(0, name.length-1);
			self.line[line][block][name][index-1] = value;
		}
		else
		{
			self.line[line][block][name] = value;
			if (name == "wave2")
				self.line[line].dco.wave2on = (value != -1);
		}
	}
}

//
// -- maps parameter names (used in gui) to parameter indices (used in dsp)
// -- descriptors would automate this
//
NS.Patch.getParamID = function (name)
{
	// -- common parameters
	var id = NS.Patch.commonParams[name];
	if (id !== undefined) return id;
	
	// -- line parameters
	var line  = (name[3] | 0) - 1;
	var block = name.substr(0,3);
	name = name.substr(4);
	id = NS.Patch.lineParams[block + name];
	if (id !== undefined && id >= 0)
	{
		if (line == 1)
		{
			if (id == 15 || id == 16) id += 2;
			else if (id < 52) id += 24;
			else id += 25;
		}
	}
	
	if (id === undefined) id = -1;
	return id;
}

// including performance params
NS.Patch.commonParams =
{
	vibrato:-1, solo:0, portamento:4, portatime:-1, bend:5, transpose:-1,
	wave:180, delay:181, rate:176, depth:182, octave:3,
	detdir:22, detoct:23, detnote:24, detfine:25, lineout:21, mod:26
};

NS.Patch.lineParams =
{ 
	dcowave1:15, dcowave2:16, dcosustain:34, dcoend:35,
	dcorate1:44, dcorate2:45, dcorate3:46, dcorate4:47, dcorate5:48, dcorate6:49, dcorate7:50, dcorate8:51,
	dcolevel1:37, dcolevel2:38, dcolevel3:39, dcolevel4:40, dcolevel5:41, dcolevel6:42, dcolevel7:43, dcolevel8:-1,
	dcwkeyfollow:78, dcwsustain:83, dcwend:84,
	dcwrate1:93, dcwrate2:94, dcwrate3:95, dcwrate4:96, dcwrate5:97, dcwrate6:98, dcwrate7:99, dcwrate8:100,
	dcwlevel1:86, dcwlevel2:87, dcwlevel3:88, dcwlevel4:89, dcwlevel5:90, dcwlevel6:91, dcwlevel7:92, dcwlevel8:-1,
	dcakeyfollow:128, dcasustain:133, dcaend:134,
	dcarate1:143, dcarate2:144, dcarate3:145, dcarate4:146, dcarate5:147, dcarate6:148, dcarate7:149, dcarate8:150,
	dcalevel1:136, dcalevel2:137, dcalevel3:138, dcalevel4:139, dcalevel5:140, dcalevel6:141, dcalevel7:142, dcalevel8:-1
};
}(WAM.Synths.webCZ101));

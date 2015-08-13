(function(NS) {
NS.Memory = function ()
{
	this.patch = new NS.Patch();	// working area
	var banks = [[],[],[]];			// preset, internal, cart
	var czgui = document.querySelector("cz-101");
	var self  = this;
	
	for (var b=0; b<3; b++)
	for (var p=0; p<16; p++)
		banks[b][p] = new NS.Patch();

	// -- loads internal and preset banks
	this.loadPresets = function ()
	{
		return new Promise(function (resolve, reject)
		{
			load("../patches/cz101-internal.bank").then( function (data) { setBank(data, 1); });
			load("../patches/cz101-preset.bank").then( function (data) {
				setBank(data, 0);
				self.selectPatch(0);
				resolve(banks[0][0]);
				});
		});
	}
	
	this.loadUserPreset = function (url, data)
	{
		return new Promise(function (resolve, reject)
		{
			load(url, data).then(function (data)
			{
				if (data.byteLength == 264)
				{
					var p = setPatch(data);
					p.name = data.name;
					resolve(p);
				}
				else { setBank(data, 2); resolve(null); }
			});
		});
	}
	
	this.selectPatch = function (idpatch, idbank)
	{
		idpatch = idpatch == undefined ? -1 : idpatch;
		idbank  = idbank  == undefined ?  0 : idbank;
		if (0 <= idbank && idbank <= 2 && -1 <= idpatch && idpatch < 16)
		{
			this.patch = banks[idbank][idpatch].clone();
			return this.patch;
		}
		return null;
	}
	
	this.getPatch = function (idpatch, idbank)
	{
		idpatch = idpatch == undefined ? -1 : idpatch;
		idbank  = idbank  == undefined ?  0 : idbank;
		if (0 <= idbank && idbank <= 2 && -1 <= idpatch && idpatch < 16)
		{
			if (idpatch == -1) return self.patch;
			else return banks[idbank][idpatch];
		}
		return null;
	}

	
	// -------------------------------------------------------------------------
	// helpers
	//
		
	var setPatch = function (syx, idpatch, idbank)
	{
		idpatch = idpatch == undefined ? -1 : idpatch;
		idbank  = idbank  == undefined ?  0 : idbank;
		if (1 <= idbank && idbank <= 2 && -1 <= idpatch && idpatch < 16)
		{
			var p = new CZPatch();
			p.parse(syx);
			if (idpatch == -1) self.patch = p;
			else banks[idbank][idpatch] = p;
			return p;
		}
		return null;
	}
	
	var getBank = function (idbank)
	{
		if (0 <= idbank && idbank <= 2) return banks[idbank];
		else return null;
	}

	var setBank = function (data, idbank)
	{
		idbank = idbank ? idbank : 0;
		if (idbank < 0 || idbank > 2) return false;
		banks[idbank] = [];
		var names;
		if (idbank == 0) names = presetNames;
		else if (idbank == 1) names = internalNames;
		
		var sysex = new NS.SysEx(data);
		for (var i=0; i<sysex.numPatches; i++)
		{
			var offset = i*264;
			var dump   = data.subarray(offset, offset+264);
			var patch  = sysex.parse(dump);
			banks[idbank].push(patch);
			banks[idbank][i].name = names ? names[i] : "NONAME";
		}
		return true;
	}
	
	// 'data' is undefined : load from 'url'
	// 'data' is File : read contents of file
	function load(url, data)
	{
		if (!data) return new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.responseType = "arraybuffer";
			xhr.onload = function (e) { resolve(new Uint8Array(xhr.response)); }
			xhr.open("get", url, true);
			xhr.send();
			});
		else if (data instanceof File)
			return new Promise(function (resolve, reject) {
			var self = this;
			var reader = new FileReader();
			reader.onload = function (le) { resolve(new Uint8Array(le.target.result)); };
			reader.readAsArrayBuffer(data);
			});
	}

	var presetNames = [
		"BRASS ENS.1", "TRUMPET", "VIOLIN", "STRING ENS.1", "ELEC.PIANO",
		"ELEC.ORGAN", "FLUTE", "SYNTH.BASS", "BRASS ENS.2", "VIBRAPHONE",
		"CRISPY XYLOPHONE", "SYNTH.STRINGS", "FAIRY TALE", "ACCORDION", "WHISTLE", 
		"PERCUSSION" ];
	var internalNames = [
		"FANTASTIC PIANO", "BRASS ENS.3", "SYNTH.GLOCKEN", "STRING ENS.2", "BLUES HARMONICA",
		"XYLOPHONE", "FANTASTIC SOUND 1", "FAT BASS", "FUNKY CLAVI.", "SOFT ORGAN",
		"CARILLON", "SOUTHERN WING", "SYNTH.STRING 2", "SYNTH.BLOCKS", "FANTASTIC SOUND 2",
		"STEEL DRUM 1" ];
}
}(WAM.Synths.webCZ101));

// ----------------------------------------------------------------------------
// controller
//
WAM.Synths.webCZ101 = function ()
{
	var memory = new WAM.Synths.webCZ101.Memory();
	var czgui  = document.querySelector("wam-webcz101");
	var self   = this;
	var ibank,ipatch,patch;
	
	this.init = function (actx, bufsize)
	{
		var processor = new WAM.ProcessorASMJS(WAM.Synths.webCZ101, "Module");	
		memory.loadPresets().then(function (p)
		{
			patch = p;
			ibank = 0;
			ipatch = 1;
			self.setPatch(patch.toArray());
			if (czgui)
			{
				czgui.setPatch(patch, 0, 0);
				czgui.addEventListener("czload", onload);
				czgui.addEventListener("czprogchange", onpatch);
				czgui.addEventListener("czparamchange", onparam);
			}
		});
		
		var desc = { audio: { outputs: [{ id:0, channels:2 }] } };
		return this.setup(actx, bufsize, desc, processor);
	}

	function onload (e)
	{
		var url  = e.detail.url;
		var data = e.detail.data;
		memory.loadUserPreset(url, data).then(function (p)
		{
			if (ibank == 2 || p)
			{
				if (p) { ipatch = -1; ibank = 3; }
				else p = memory.getPatch(ipatch, ibank);
				patch = p;
				if (czgui) czgui.setPatch(patch, ipatch, ibank);
				self.setPatch(patch.toArray());
			}
		});
	}
	
	function onpatch (e)
	{
		if (e.detail.idpatch === undefined) return;
		ipatch = e.detail.idpatch;
		ibank  = e.detail.idbank		
		patch  = memory.selectPatch(ipatch, ibank);
		if (patch)
		{
			if (czgui) czgui.setPatch(patch, ipatch, ibank);
			self.setPatch(patch.toArray());
			/* var arr = patch.toArray();
			for (var i=2; i<arr.length; i+=2)
				self.setParam(arr[i], arr[i+1]); */
		}
	}
	
	function onparam (e)
	{
		var id = WAM.Synths.webCZ101.Patch.getParamID(e.detail.id);
		if (id >= 0)
		{
			self.setParam(id, e.detail.value);
			patch.setParam(e.detail.id, e.detail.value);
		}
	}
}

WAM.Synths.webCZ101.prototype = new WAM.Controller("sync");

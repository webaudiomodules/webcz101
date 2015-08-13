	// var butt;
	var svgns = "http://www.w3.org/2000/svg";
	Polymer({ is:"cz-button",
		properties: {
			led: { type:Boolean, value:false },
			bottomled: { type:Boolean, value:false },
			selected: { type:Boolean, value:false, observer:"onSelect" },
			auto: { type:Boolean, value:false },
			labelin: { type:Boolean, value:false },
			toplabel: { type:Boolean, value:false },
			haslabelin: { type:Boolean, value:false, computed:"_haslabelin(labelin,toplabel)" },
			hasbottomlabel: { type:Boolean, value:false, computed:"_hasbottomlabel(labelin,toplabel)" },
			redin: { type:Boolean, value:false }
		},
		_haslabelin: function (labelin,toplabel) { return labelin },
		_hasbottomlabel: function (labelin,toplabel) { return (!labelin && !toplabel) },
		onSelect: function ()
		{
			if (this.led && this.$.led) this.$.led.active = this.selected;
			else if (this.bottomled && this.$.bottomled) this.$.bottomled.active = this.selected;
		},
		_content: "",
		_onContent: function ()
		{
			this._content = Polymer.dom(this.$.content).getDistributedNodes()[0].textContent;
		},
		active: false,
		ready: function ()
		{
			if (this.classList.contains("dark"))
				 this.$.czbuttonhost.classList.add("dark");
			if (this.led || this.bottomled)
			{
				if (this.led) // (this.localName == "cz-button")
				{
					this.$.led.classList.add("top");
					if (this.$.label) this.$.label.classList.add("bottom");
				}
				else
				{
					// this.$.button.style.marginBottom = "10px !important";
					// this.$.bottomled.classList.add("bottom");
					// if (this.$.toplabel) this.$.toplabel.classList.add("top");
				}
				// var w1 = this.offsetWidth;
				// var w2 = 14;
				//	this.$.led.style.marginLeft = (w1 - w2) / 2;
			}
			else if (!this.labelin)
			{
				this.$.inset.style.position = "relative";
				this.$.inset.style.top = "-6px";
			}
			if (this.redin)
			{
				var tri = this.$.tri;
				if (this.classList.contains("larrow"))
					tri.style.transform = "translate(13px,4px)";
				else if (this.classList.contains("rarrow"))
					tri.style.transform = "rotate(180deg) translate(-16px,-4px)";
				else if (this.classList.contains("uarrow"))
					tri.style.transform = "rotate(90deg) translate(4px,-14px)";
				else if (this.classList.contains("darrow"))
					tri.style.transform = "rotate(270deg) translate(-5px,14px)";
				else
				{
					tri.style.display = "none";
					this.$.rect.style.display = "block";
				}
			}
			this.$.button.addEventListener("mousedown", this, false);
		},
		handleEvent: function (e)
		{
			if (e.type == "mousedown")
			{
				this.active = true;
				var butt = this.$.button;
				butt.classList.add("active");
				butt.addEventListener("mouseleave", this, false);
				butt.addEventListener("mouseenter", this, false);
				window.addEventListener("mousemove", this, false);
				window.addEventListener("mouseup", this, false);
			}
			else if (e.type == "mousemove")
			{
				if (!this.active)
					this.$.button.classList.remove("active");
				else if (this.$.button.className.indexOf("active") < 0)
					this.$.button.classList.add("active");
			}
			else if (e.type == "mouseup")
			{
				this.$.button.classList.remove("active");
				window.removeEventListener("mousemove", this, false);
				window.removeEventListener("mouseup", this, false);
				if (this.active)
				{
					if (this.auto) this.selected = !this.selected;
					this.active = false;
					this.fire("change", { sender:this, value:this.selected });
				}
			}
			else if (e.type == "mouseenter") this.active = true;
			else if (e.type == "mouseleave") this.active = false;
		}
	});


Polymer({ is:"cz-button2",
		properties: {
			led: { type:Boolean, value:false },
			selected: { type:Boolean, value:false, observer:"onSelect" },
			auto: { type:Boolean, value:true },
			labelin: { type:Boolean, value:false },
			redin: { type:Boolean, value:false }
		},
		onSelect: function ()
		{
			if (!this.$.led) return;
			this.$.led.active = this.selected;
		},
		_content: "",
		_onContent: function ()
		{
			this._content = Polymer.dom(this.$.content).getDistributedNodes()[0].textContent;
		},
		active: false,
		ready: function ()
		{
			if (this.classList.contains("dark"))
				 this.$.czbuttonhost.classList.add("dark");
			if (this.led)
			{
				if (this.localName == "cz-button")
				{
					this.$.led.classList.add("top");
					if (this.$.label) this.$.label.classList.add("bottom");
				}
				else
				{
					this.$.led.classList.add("bottom");
					if (this.$.label) this.$.label.classList.add("top");
				}
				var w1 = this.offsetWidth;
				var w2 = 14;
				this.$.led.style.marginLeft = (w1 - w2) / 2;
			}
			else if (!this.labelin)
			{
				this.$.inset.style.position = "relative";
				this.$.inset.style.top = "-6px";
			}
			if (this.redin)
			{
				var tri = this.$.tri;
				if (this.classList.contains("larrow"))
					tri.style.transform = "translate(13px,4px)";
				else if (this.classList.contains("rarrow"))
					tri.style.transform = "rotate(180deg) translate(-16px,-4px)";
				else if (this.classList.contains("uarrow"))
					tri.style.transform = "rotate(90deg) translate(4px,-14px)";
				else if (this.classList.contains("darrow"))
					tri.style.transform = "rotate(270deg) translate(-5px,14px)";
				else
				{
					tri.style.display = "none";
					this.$.rect.style.display = "block";
				}
			}
			this.$.button.addEventListener("mousedown", this, false);
		},
		handleEvent: function (e)
		{
			if (e.type == "mousedown")
			{
				this.active = true;
				var butt = this.$.button;
				butt.classList.add("active");
				butt.addEventListener("mouseleave", this, false);
				butt.addEventListener("mouseenter", this, false);
				window.addEventListener("mousemove", this, false);
				window.addEventListener("mouseup", this, false);
			}
			else if (e.type == "mousemove")
			{
				if (!this.active)
					this.$.button.classList.remove("active");
				else if (this.$.button.className.indexOf("active") < 0)
					this.$.button.classList.add("active");
			}
			else if (e.type == "mouseup")
			{
				this.$.button.classList.remove("active");
				window.removeEventListener("mousemove", this, false);
				window.removeEventListener("mouseup", this, false);
				if (this.active)
				{
					if (this.auto) this.selected = !this.selected;
					this.active = false;
					this.fire("change", { sender:this, value:this.selected });
				}
			}
			else if (e.type == "mouseenter") this.active = true;
			else if (e.type == "mouseleave") this.active = false;
		}
	});
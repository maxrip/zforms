ZForms.Widget.Select = ZForms.Widget.inheritTo(	
	{
		
		__constructor : function(
			oElement,
			oClassElement,
			oOptions
			) {

			this.__base(
				oElement,
				oClassElement,
				oOptions
				);

			this.aOptions = [];

			for(var i = 0; i < this.oElement.options.length; i++) {
				this.aOptions[i] = {
					sLabel : this.oElement.options[i].innerHTML,
					sValue : this.oElement.options[i].value
					};
			}

		},

		setValue : function(oValue) {

			for(var i = 0; i < this.aOptions.length; i++) {
				if(this.aOptions[i].sValue == oValue.toStr()) {

					this.oElement.selectedIndex = i;
					break;

				}
			}

			this.__base(oValue);

		},

		getEventList : function() {

			return [this.__self.DOM_EVENT_TYPE_CHANGE, this.__self.DOM_EVENT_TYPE_KEYUP];

		},

		setValueFromElement : function() {

			if(this.oElement.selectedIndex >= 0) {
				this.oValue.set(this.oElement.options[this.oElement.selectedIndex].value);
			}
			else {
				this.oValue.reset();
			}

			this.__base();

		},

		enableOptionsByValue : function(
			aPatternGroups,
			bJoin
			) {

			this.oElement.options.length = 0;

			for(var i = 0, bMatched, bEnable, oOption; i < this.aOptions.length; i++) {

				oOption = this.aOptions[i];

				bEnable = false;

				for(var j = 0; j < aPatternGroups.length; j++) {

					bMatched = false;

					for(var k = 0; k < aPatternGroups[j].length && !bMatched; k++) {
						bMatched = aPatternGroups[j][k].test(oOption.sValue);
					}

					if(bMatched) {
						if(bJoin || j == 0) {
							bEnable	= true;
						}
					}
					else if(!bJoin) {
						bEnable = false;
					}

				}

				if(bEnable) {
					this.oElement.options[this.oElement.options.length] = new Option(
						oOption.sLabel,
						oOption.sValue,
						this.getValue().isEqual(oOption.sValue)
						);
				}

			}

			this.processEvents(true);

		}

	}
	);
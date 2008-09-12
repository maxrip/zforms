ZForms.Widget.Text.Combo = ZForms.Widget.Text.inheritTo(
	{
	
		__constructor : function(
			oElement,
			oClassElement,
			oOptions	
			) {

			if(!oOptions.bTemplate && Common.Browser.isOpera()) {
						
				var oNewOptionsElement = Common.Dom.createElement(
					'select',
					{
						'name'  : oOptions.oOptionsElement.name,
						'id'    : oOptions.oOptionsElement.id,
						'class' : oOptions.oOptionsElement.className
					}
					);		
								
				for(var i = 0, aOptions = oOptions.oOptionsElement.options; i < aOptions.length; i++) {
					oNewOptionsElement.options[oNewOptionsElement.options.length] = new Option(aOptions[i].innerHTML, aOptions[i].value);
				}
				
				oOptions.oOptionsElement.parentNode.replaceChild(oNewOptionsElement, oOptions.oOptionsElement);		
				oOptions.oOptionsElement = oNewOptionsElement;
				oOptions.oOptionsElement.size = this.__self.DEFAULT_PAGE_SIZE;
						
			}
			
			this.oShowOptionsButton = null;
			
			if(!oOptions.bTemplate && oOptions.oShowOptionsElement) {
			
				oOptions.oShowOptionsElement.tabIndex = -1;
			
				this.oShowOptionsButton = ZForms.createButton(
					oOptions.oShowOptionsElement
					);
					
			}

			this.__base(
				oElement,
				oClassElement,
				oOptions
				);

			this.oOptions.oOptionsElement = oOptions.oOptionsElement;
			this.oOptions.oOptionsElement.tabIndex = -1;
			
			if(this.isTemplate()) {
				return;
			}		
			
			this.iPageSize = this.oOptions.oOptionsElement.size || this.__self.DEFAULT_PAGE_SIZE;
			
			Common.Class.add(
				this.oOptions.oOptionsElement,
				this.__self.CLASS_NAME_COMBO_LIST
				);

			this.bOptionsShowed = false;
			this.aOptions = [];
			this.aOptionsCurrent = [];

			this.oElement.setAttribute('autocomplete', 'off');
			this.oOptions.oOptionsElement.setAttribute('size', this.iPageSize);		
			
			this.iSelectedIndex = 0;
			this.sLastSearchValue = null;

			this.initOptions();
			this.hideOptions();		

			this.oOptions.oOptionsElement.options.length = 0;

		},	

		addExtendedHandlers : function() {

			var
				oThis = this,
				bProcessFocus = true,
				bProcessBlur = true
				;

			if(this.hasPlaceHolder()) {
				Common.Event.add(
					this.oElement,
					this.__self.DOM_EVENT_TYPE_FOCUS,
					function() {
					
						oThis.disablePlaceHolder();
					
					}
					);
			}			

			Common.Event.add(
				this.oElement,
				this.__self.DOM_EVENT_TYPE_KEYUP,
				function(oEvent) {					

					oThis.dispatchKeyEvent(Common.Event.normalize(oEvent).iKeyCode);

				}
				);

			Common.Event.add(
				this.oElement,
				this.__self.DOM_EVENT_TYPE_FOCUS,
				function(oEvent) {				
					
					if(!bProcessFocus) {
						
						bProcessFocus = true;															
						return;
												
					}										

					if(oThis.bPlaceHolderEnabled) {
						oThis.disablePlaceHolder();
					}
					
					oThis.updateOptions(true);

				}
				);

			Common.Event.add(
				this.oElement,
				this.__self.DOM_EVENT_TYPE_KEYPRESS,
				function(oEvent) {

					var oEvent = Common.Event.normalize(oEvent);
					
					if(oEvent.iKeyCode == oThis.__self.KEY_CODE_ENTER) {
						Common.Event.cancel(oEvent);
					}					

				}
				);

			Common.Event.add(
				document,
				this.__self.DOM_EVENT_TYPE_CLICK,
				function(oEvent) {
					
					if(Common.Event.normalize(oEvent).target == oThis.oElement) {						
						return;
					}					
					
					oThis.hideOptions();
					
					if(!oThis.bPlaceHolderEnabled) {
						oThis.enablePlaceHolder();
					}

				}
				);

			Common.Event.add(
				[this.oOptions.oOptionsElement, this.oElement],
				this.__self.DOM_EVENT_TYPE_BLUR,
				function(oEvent) {																			
					
					if(bProcessBlur && oThis.hasPlaceHolder()) {											
						oThis.enablePlaceHolder();
					}
					
					if(bProcessBlur) {
						oThis.hideOptions();
					}
					
					bProcessBlur = true;					

				}
				);

			Common.Event.add(
				this.oOptions.oOptionsElement,
				this.__self.DOM_EVENT_TYPE_FOCUS,
				function(oEvent) {
					
					oThis.showOptions();

				}
				);

			Common.Event.add(
				this.oOptions.oOptionsElement,
				this.__self.DOM_EVENT_TYPE_CHANGE,	
				function() {					

					oThis.selectFromOptions();
					
					bProcessFocus = false;
					
					oThis.oElement.focus();

				}
				);
				
			Common.Event.add(
				[this.oOptions.oOptionsElement].concat(this.oOptions.oShowOptionsElement? [this.oOptions.oShowOptionsElement] : []),
				this.__self.DOM_EVENT_TYPE_MOUSEDOWN,
				function() {					
					
					bProcessBlur = false;					

				}
				);					
				
			if(this.oShowOptionsButton) {				
			
				Common.Event.add(
					this.oOptions.oShowOptionsElement,
					this.__self.DOM_EVENT_TYPE_MOUSEUP,
					function() {
					
						bProcessBlur = true;	
					
					}
					);
			
				this.oShowOptionsButton.setHandler(
					function(oEvent) {
						
						Common.Event.cancel(oEvent);												
						
						oThis.updateOptions(true, '');
						
						bProcessFocus = false;
						
						oThis.oElement.focus();						
					
					}
					);				
			}

		},

		initOptions : function() {

			var aOptions = this.oOptions.oOptionsElement.options;

			for(var i = 0; i < aOptions.length; i++) {
				this.aOptions[i] = {
					sLabel       : aOptions[i].innerHTML,
					sValue       : aOptions[i].value,
					sSearchValue : aOptions[i].innerHTML.toLowerCase()
					};
			}

			this.aOptionsCurrent = this.aOptions;

		},

		dispatchKeyEvent : function(iKeyCode) {
			
			switch(iKeyCode) {
				
				case this.__self.KEY_CODE_ARROW_UP:
					this.selectPrevOption();
				break;

				case this.__self.KEY_CODE_ARROW_DOWN:
					this.selectNextOption();
				break;

				case this.__self.KEY_CODE_PAGE_UP:
					this.selectPrevPage();
				break;

				case this.__self.KEY_CODE_PAGE_DOWN:
					this.selectNextPage();
				break;

				case this.__self.KEY_CODE_HOME:
					this.selectFirstOption();
				break;

				case this.__self.KEY_CODE_END:
					this.selectLastOption();
				break;

				case this.__self.KEY_CODE_ENTER:				
					if(this.bOptionsShowed) {
						this.selectFromOptions();
					}					
				break;
				
				case this.__self.KEY_CODE_TAB:				
					return;					
				break;

				default:
					this.updateOptions(false);
				break;

			}

		},

		selectPrevOption : function() {

			if(this.iSelectedIndex > 0) {
				this.iSelectedIndex--;
			}

			this.updateSelectedIndex();

		},

		selectNextOption : function() {

			if(this.iSelectedIndex < this.oOptions.oOptionsElement.options.length - 1) {
				this.iSelectedIndex++;
			}

			this.updateSelectedIndex();

		},

		selectPrevPage : function() {

			var iPrevPageIndex = this.iSelectedIndex - this.iPageSize;

			if(iPrevPageIndex > 0) {
				this.iSelectedIndex = iPrevPageIndex;
			}
			else {
				this.iSelectedIndex = 0;
			}

			this.updateSelectedIndex();

		},

		selectNextPage : function() {

			var iNextPageIndex = this.iSelectedIndex + this.iPageSize;

			if(iNextPageIndex < this.oOptions.oOptionsElement.options.length - 1) {
				this.iSelectedIndex = iNextPageIndex;
			}
			else {
				this.iSelectedIndex = this.oOptions.oOptionsElement.options.length - 1;
			}

			this.updateSelectedIndex();

		},

		selectFirstOption : function() {

			this.iSelectedIndex = 0;

			this.updateSelectedIndex();

		},

		selectLastOption : function() {

			this.iSelectedIndex = this.oOptions.oOptionsElement.options.length - 1;

			this.updateSelectedIndex();

		},

		selectFromOptions : function() {
			
			if(this.oOptions.oOptionsElement.options.length > 0 && this.oOptions.oOptionsElement.selectedIndex > -1) {
				
				if(this.hasPlaceHolder()) {
					this.disablePlaceHolder();
				}

				this.iSelectedIndex = this.oOptions.oOptionsElement.selectedIndex;							
				this.sLastSearchValue = this.oElement.value.toLowerCase();					
				this.setValue(new ZForms.Value(this.oOptions.oOptionsElement.options[this.iSelectedIndex].innerHTML));										

			}
			
			var oThis = this;
			
			setTimeout(
				function() {
				
					oThis.hideOptions()
					
				},
				0
				);
			

		},

		updateSelectedIndex : function() {

			if(this.iSelectedIndex > -1) {
				this.oOptions.oOptionsElement.selectedIndex = this.iSelectedIndex;
			}

		},

		updateOptions : function(bAlways, sValue) {
			
			var
				sSearchedValue = this.oElement.value.toLowerCase(),
				sNewValue = typeof(sValue) == 'undefined'? sSearchedValue : sValue
				;
			
			if(!bAlways && this.sLastSearchValue == sNewValue) {
				return;
			}
			
			var
				i = 0,
				
				iLength = this.aOptionsCurrent.length,
				iOptionsCount = 0,
				bFound = false,
				aOptions = this.oOptions.oOptionsElement.options
				;

			this.sLastSearchValue = sNewValue;

			this.oOptions.oOptionsElement.options.length = 0;
			this.oOptions.oOptionsElement.innerHTML = '';
			
			while(i < iLength) {

				if(this.aOptionsCurrent[i].sSearchValue.indexOf(sNewValue) > -1) {

					aOptions[iOptionsCount++] = new Option(this.aOptionsCurrent[i].sLabel, this.aOptionsCurrent[i].sValue);

					if(sSearchedValue == this.aOptionsCurrent[i].sSearchValue) {

						this.iSelectedIndex = iOptionsCount - 1;
						bFound = true;

					}

				}

				i++;

			}			
			
			if(!bFound) {
				this.iSelectedIndex = -1;
			}

			if(iOptionsCount > 0) {

				this.updateSelectedIndex();				
				this.showOptions();

			}
			else {
				this.hideOptions();
			}

		},

		showOptions : function() {
		
			if(this.bOptionsShowed) {
				return;
			}
					
			this.addClass(this.__self.CLASS_NAME_COMBO_LIST_ACTIVE);
								
			this.bOptionsShowed = true;

		},

		hideOptions : function() {
			
			if(!this.bOptionsShowed) {
				return;
			}
					
			this.removeClass(this.__self.CLASS_NAME_COMBO_LIST_ACTIVE);			
						
			this.bOptionsShowed = false;

		},

		enableOptionsByValue : function(
			aPatternGroups,
			bJoin
			) {

			this.aOptionsCurrent = [];

			for(var i = 0, bMatched, bEnable, oOption; i < this.aOptions.length; i++) {

				oOption = this.aOptions[i];

				bEnable = false;

				for(var j = 0; j < aPatternGroups.length; j++) {

					bMatched = false;

					for(var k = 0; k < aPatternGroups[j].length && !bMatched; k++) {
						bMatched = oOption.sValue.match(aPatternGroups[j][k])? true : false;
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
					this.aOptionsCurrent.push(oOption);
				}

			}

			this.sLastSearchValue = null;
			this.iSelectedIndex = -1;

		},

		disable : function(bByParent) {

			if(!this.__base(bByParent)) {
				return false;
			}

			this.oOptions.oOptionsElement.disabled = true;
			
			if(this.oShowOptionsButton) {
				this.oShowOptionsButton.disable();
			}

			return true;

		},

		enable : function(bByParent) {

			if(!this.__base(bByParent)) {
				return false;
			}

			this.oOptions.oOptionsElement.disabled = false;

			if(this.oShowOptionsButton) {
				this.oShowOptionsButton.enable();
			}

			return true;

		},

		updateElements : function(iIndex) {

			this.oOptions.oOptionsElement = document.getElementById(iIndex > 0?
				this.oOptions.oOptionsElement.id.match(ZForms.Widget.Container.Multiplicator.REG_EXP_REPLACE)[1] + '_' + iIndex :
				this.oOptions.oOptionsElement.id
				);

			this.__base(iIndex);

		},

		clone : function(
			oElement,
			oClassElement,
			iIndex
			) {

			var oNewOptions = Common.Object.extend(
				{
					oOptionsElement     : document.getElementById(this.oOptions.oOptionsElement.id.match(ZForms.Widget.Container.Multiplicator.REG_EXP_REPLACE)[1] + '_' + iIndex),
					oShowOptionsElement : this.oOptions.oShowOptionsElement? document.getElementById(this.oOptions.oShowOptionsElement.id.match(ZForms.Widget.Container.Multiplicator.REG_EXP_REPLACE)[1] + '_' + iIndex) : null,
					bTemplate           : false
				},
				this.oOptions
				);
							
			return new this.__self(
				oElement,
				oClassElement,
				oNewOptions
				);

		},

		destruct : function() {

			this.oOptions.oOptionsElement = null;
			
			if(this.oShowOptionsButton) {
				this.oShowOptionsButton.destruct();
			}

			this.__base();

		}

	},
	{
	
		DEFAULT_PAGE_SIZE : 5,

		CLASS_NAME_COMBO_LIST        : 'combo-list',
		CLASS_NAME_COMBO_LIST_ACTIVE : 'combo-field-active'
		
	}
	);
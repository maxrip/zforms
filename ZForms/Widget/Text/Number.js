ZForms.Widget.Text.Number = ZForms.Widget.Text.inheritTo(
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
				
			this.oHiddenElement = null;	
				
			if(this.isTemplate()) {	
				return;
			}
			
			this.replaceElement(oElement);			
		
		},
		
		replaceElement : function(oElement) {
		
			this.oHiddenElement = oElement.parentNode.insertBefore(
				Common.Dom.createElement(
					'input',
					{
						'type'  : 'hidden',
						'id'    : 'value-' + oElement.getAttribute('id'),
						'name'  : oElement.getAttribute('name')
					}
					),
				oElement
				);
				
			oElement.name = 'to-str-' + oElement.name;			
		
		},
		
		getDefaultOptions : function() {
		
			return Common.Object.extend(
				this.__base(),
				{
					bFloat    : false,
					bNegative : false			
				},
				true
				);
		
		},
				
		createValue : function(mValue) {

			return new ZForms.Value.Number(mValue);

		},

		addExtendedHandlers : function() {

			if(!this.__base()) {
				return;
			}			
			
			var oThis = this;

			Common.Event.add(
				this.oElement,
				this.__self.DOM_EVENT_TYPE_KEYPRESS,
				function(oEvent) {					

					var oEvent = Common.Event.normalize(oEvent);														
					
					if(
						oEvent.ctrlKey ||
						oEvent.charCode == 0 ||
						(oEvent.iKeyCode >= 48 && oEvent.iKeyCode <= 57) ||
						(oThis.oOptions.bFloat && (oEvent.iKeyCode == 44 || oEvent.iKeyCode == 46)) ||
							(oThis.oOptions.bNegative && oEvent.iKeyCode == 45)
							) {
							return;
					}
					
					Common.Event.cancel(oEvent);								

				}
				);

			Common.Event.add(
				this.oElement,
				this.__self.DOM_EVENT_TYPE_BLUR,
				function() {
						
					if(oThis.bPlaceHolderEnabled) {
						return;
					}
					
					oThis.setValue(oThis.createValue(oThis.oElement.value));					

				}
				);

		},
		
		updateElementValue : function(oValue) {
			
			this.oHiddenElement.value = oValue.toStr();
			
			if(ZForms.Resources.getNumberSeparator() == ',') {
				oValue = new ZForms.Value(oValue.toStr().replace(/\./g, ','));
			}			
			
			this.__base(oValue);
		
		},
		
		setValue : function(oValue) {
			
			if(!oValue.isEmpty()) {						
		
				if(!this.oOptions.bFloat) {
					oValue.set(parseInt(oValue.get().toString().replace(/[\.\,].*/g, ''), 10));
				}
			
				if(!this.oOptions.bNegative && oValue.get() < 0) {
					oValue.set(oValue.get() * -1);
				}				
				
			}		
		
			return this.__base(oValue);
		
		},
		
		init : function() {
		
			this.__base();
			
			if(this.oElement.value != this.getValue().toStr()) {
				this.setValue(this.getValue());
			}
		
		},
		
		destruct : function() {
		
			this.oHiddenElement = null;
		
			this.__base();
		
		}

	}
	);
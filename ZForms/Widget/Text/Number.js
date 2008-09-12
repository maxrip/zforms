ZForms.Widget.Text.Number = ZForms.Widget.Text.inheritTo(
	{
		
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
					
					oThis.setValue(new ZForms.Value.Number(oThis.oElement.value));					

				}
				);

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
			
			this.oValue.get();
		
			return this.__base(oValue);
		
		}

	}
	);
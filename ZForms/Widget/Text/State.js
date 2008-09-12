ZForms.Widget.Text.State = ZForms.Widget.Text.inheritTo(
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
		
			this.bLastProcessedChecked = null;
			
		},
		
		check : function() {
			
			this.oElement.checked = true;	
	
		},
	
		uncheck : function() {
	
			this.oElement.checked = false;
	
		},

		isChecked : function() {
	
			return this.oElement.checked;
	
		},
	
		getEventList : function() {
	
			return [this.__self.DOM_EVENT_TYPE_CLICK];
	
		},

		isChanged : function() {
	
			return this.bLastProcessedChecked != this.oElement.checked;		
	
		},

		updateLastProcessedValue : function() {
		
			this.bLastProcessedChecked = this.oElement.checked;
			
		}
		
	}
	);
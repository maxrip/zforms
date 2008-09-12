ZForms.Widget.Button.Submit = ZForms.Widget.Button.inheritTo(
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
				
		},	
		
		getDefaultOptions : function() {
		
			return Common.Object.extend(
				this.__base(),
				{
					bDisableOnSubmit : true							
				},
				true
				);
		
		},
	
		setForm : function(oForm) {

			this.__base(oForm);
	
			this.oForm.addSubmit(this);	
	
		},
		
		prepareForSubmit : function() {
		
			if(this.oOptions.bDisableOnSubmit) {
				this.disable();
			}
			
			this.__base();
		
		},
		
		addDependence : function(mDependence) {}
						
	}
	);
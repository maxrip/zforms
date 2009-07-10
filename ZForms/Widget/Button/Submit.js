ZForms.Widget.Button.Submit = ZForms.Widget.Button.inheritTo(
	{

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

			if(!this.oOptions.bDisableOnSubmit) {
				return;
			}

			var oThis = this;

			this.setHandler(
				function() {
					
					oThis.oForm.setCurrentSubmit(oThis);

				}
				);

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
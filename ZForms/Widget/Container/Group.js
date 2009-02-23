ZForms.Widget.Container.Group = ZForms.Widget.Container.inheritTo(
	{

		hasValue : function() {

			return true;

		},

		getName : function() {

			return this.aChildren[0]? this.aChildren[0].oElement.name : '';

		},

		addChild : function(oChild) {

			if(!(oChild instanceof ZForms.Widget.Text.State)) {
				return;
			}

			return this.__base(oChild);

		},

		processEvents : function(
			bUpdateSubmit,
			bStateChanged,
			bByParent
			) {

			this.__base(
				bUpdateSubmit,
				bStateChanged,
				bByParent
				);

			if(!bByParent) {
				for(var i = 0; i < this.aChildren.length; i++) {

					this.aChildren[i].updateLastProcessedValue();

					if(this.aChildren[i].isChecked()) {
						this.aChildren[i].addClass(this.__self.CLASS_NAME_SELECTED);
					}
					else {
						this.aChildren[i].removeClass(this.__self.CLASS_NAME_SELECTED);
					}

				}
			}

		},

		enable : function(bByParent) {

			var bReturnValue = this.__base(bByParent);

			if(bReturnValue && !bByParent) {
				this.setValueFromElement();
			}

			return bReturnValue;

		},

		disable : function(bByParent) {

			var bReturnValue = this.__base(this, bByParent);

			if(bReturnValue && !bByParent) {
				this.setValueFromElement();
			}

			return bReturnValue;

		},

		isChanged : function() {

			return this.__base();

		}

	}
	);
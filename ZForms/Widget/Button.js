ZForms.Widget.Button = ZForms.Widget.inheritTo(
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

			this.fHandler = null;
			this.fDisableHandler = function(oEvent) {

				Common.Event.cancel(oEvent);

			};

		},

		hasValue : function() {

			return false;

		},

		setHandler : function(fHandler) {

			if(this.fHandler) {
				Common.Event.remove(
					this.oElement,
					this.__self.DOM_EVENT_TYPE_CLICK,
					this.fHandler
					);
			}

			this.fHandler = fHandler;

			if(this.isEnabled()) {
				this.enable(false, true);
			}

		},

		enable : function(
			bByParent,
			bAddHandler
			) {

			var bBaseReturnValue = this.__base(bByParent);

			if(!(bBaseReturnValue || bAddHandler)) {
				return false;
			}

			if((bAddHandler || bBaseReturnValue) &&
				this.fHandler
				) {
				Common.Event.add(
					this.oElement,
					this.__self.DOM_EVENT_TYPE_CLICK,
					this.fHandler
					);
			}

			if(bBaseReturnValue) {
				Common.Event.remove(
					[this.oElement, this.oClassElement],
					[this.__self.DOM_EVENT_TYPE_CLICK, this.__self.DOM_EVENT_TYPE_MOUSEDOWN, this.__self.DOM_EVENT_TYPE_SELECTSTART],
					this.fDisableHandler
					);
			}
			
			return bBaseReturnValue;

		},

		disable : function(bByParent) {

			if(!this.__base(bByParent)) {
				return false;
			}

			if(this.fHandler) {
				Common.Event.remove(
					this.oElement,
					this.__self.DOM_EVENT_TYPE_CLICK,
					this.fHandler
					);
			}

			Common.Event.add(
				[this.oElement, this.oClassElement],
				[this.__self.DOM_EVENT_TYPE_CLICK, this.__self.DOM_EVENT_TYPE_MOUSEDOWN, this.__self.DOM_EVENT_TYPE_SELECTSTART],
				this.fDisableHandler
				);

			return true;

		}

	},
	{

		CLASS_NAME_BUTTON : 'zf-button'

	}
	);
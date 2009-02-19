ZForms.Widget.Text = ZForms.Widget.inheritTo(
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

			this.bPlaceHolderEnabled = false;

			this.iMaxLength = oElement.maxLength? oElement.maxLength : 0;

			if(!this.isTemplate()) {
				this.addExtendedHandlers();
			}

		},

		getDefaultOptions : function() {

			return Common.Object.extend(
				this.__base(),
				{
					sPlaceHolder : ''
				},
				true
				);

		},

		updateElementValue : function(oValue) {

			this.oElement.value = oValue.toStr();

		},

		setValue : function(oValue) {

			if(oValue.isEmpty()) {

				this.updateElementValue(oValue);
				this.enablePlaceHolder();

			}
			else {

				this.disablePlaceHolder();
				this.updateElementValue(oValue);

			}

			this.__base(oValue);

		},

		getEventList : function() {

			return [this.__self.DOM_EVENT_TYPE_KEYUP, this.__self.DOM_EVENT_TYPE_BLUR, this.__self.DOM_EVENT_TYPE_CHANGE];

		},

		setValueFromElement : function() {

			// prevent IE unload bug
			if(!this.oElement) {
				return;
			}

			if(this.bPlaceHolderEnabled) {
				return;
			}

			this.oValue.set(this.oElement.value);

			this.__base();

		},

		init : function() {

			this.__base();

			if(!this.isTemplate()) {
				this.enablePlaceHolder();
			}

		},

		afterClone : function() {

			this.__base();

			this.enablePlaceHolder();

		},

		hasPlaceHolder : function() {

			return !!this.oOptions.sPlaceHolder;

		},

		addExtendedHandlers : function() {

			if(this.isTemplate()) {
				return false;
			}

			if(!this.hasPlaceHolder()) {
				return true;
			}

			var oThis = this;

			Common.Event.add(
				this.oElement,
				this.__self.DOM_EVENT_TYPE_FOCUS,
				function() {

					oThis.disablePlaceHolder();

				}
				);

			Common.Event.add(
				this.oElement,
				this.__self.DOM_EVENT_TYPE_BLUR,
				function() {

					oThis.enablePlaceHolder();

				}
				);

			return true;

		},

		enablePlaceHolder : function() {

			if(!this.hasPlaceHolder() || !this.getValue().isEmpty()) {
				return;
			}

			this.addClass(this.__self.CLASS_NAME_PLACE_HOLDER, this.oElement);

			if(this.iMaxLength > 0) {
				this.oElement.maxLength = this.oOptions.sPlaceHolder.length;
			}

			this.oElement.value = this.oOptions.sPlaceHolder;

			this.bPlaceHolderEnabled = true;

		},

		disablePlaceHolder : function() {

			if(!this.hasPlaceHolder() || !this.getValue().isEmpty()) {
				return;
			}

			this.removeClass(this.__self.CLASS_NAME_PLACE_HOLDER, this.oElement);

			if(this.iMaxLength > 0) {
				this.oElement.maxLength = this.iMaxLength;
			}

			this.oElement.value = '';

			this.bPlaceHolderEnabled = false;

		},

		destruct : function() {

			this.disablePlaceHolder();

			this.__base();

		},

		prepareForSubmit : function() {

			this.disablePlaceHolder();

			this.__base();

		}

	},
	{

		CLASS_NAME_PLACE_HOLDER : 'zf-placeholder'

	}
	);
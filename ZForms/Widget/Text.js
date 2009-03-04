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
			this.bNeedReplaceElement = this.hasPlaceHolder() || this.oElement.type.toLowerCase() == 'password';
			this.oPasswordReplacerElement = this.createPasswordElement();

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

			var oThis = this;

			Common.Event.add(
				this.oPasswordReplacerElement || this.oElement,
				this.__self.DOM_EVENT_TYPE_FOCUS,
				function() {

					oThis.addClass(oThis.__self.CLASS_NAME_FOCUSED);
					oThis.disablePlaceHolder();

				}
				);

			Common.Event.add(
				this.oElement,
				this.__self.DOM_EVENT_TYPE_BLUR,
				function() {

					oThis.removeClass(oThis.__self.CLASS_NAME_FOCUSED);
					oThis.enablePlaceHolder();

				}
				);

			return true;

		},

		enablePlaceHolder : function() {

			if(!this.hasPlaceHolder() || !this.getValue().isEmpty()) {
				return;
			}

			this.addClass(this.__self.CLASS_NAME_PLACE_HOLDER, this.oPasswordReplacerElement || this.oElement);

			if(this.iMaxLength > 0) {
				this.oElement.maxLength = this.oOptions.sPlaceHolder.length;
			}

			this.setPasswordAttribute(false);

			if(this.oPasswordReplacerElement) {
				this.oPasswordReplacerElement.value = this.oOptions.sPlaceHolder;
			}
			else {
				this.oElement.value = this.oOptions.sPlaceHolder;
			}

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

			this.setPasswordAttribute(true);

			this.oElement.value = '';

			this.bPlaceHolderEnabled = false;

		},

		createPasswordElement : function() {

			if(!this.bNeedReplaceElement || !Common.Browser.isIE()) {
				return;
			}

			return Common.Dom.createElement(
				this.oElement.tagName,
				{
					'type'      : 'text',
					'name'      : this.oElement.name,
					'id'        : this.oElement.id,
					'class'     : this.oElement.className,
					'size'      : this.oElement.size,
					'maxlength' : this.oElement.maxLength,
					'value'     : this.oElement.value,
					'style'     : this.oElement.style.cssText
				}
				);


		},

		setPasswordAttribute : function(bPassword) {

			if(!this.bNeedReplaceElement) {
				return;
			}

			if(!this.oPasswordReplacerElement) {

				this.oElement.type = bPassword? 'password' : 'text';
				return;

			}

			// ie workaround for passworded input
			if(bPassword) {

				if(!this.oPasswordReplacerElement.parentNode) {
					return;
				}

				this.oPasswordReplacerElement.parentNode.replaceChild(this.oElement, this.oPasswordReplacerElement);

				var oThis = this;

				setTimeout(
					function() {

						oThis.oElement.focus();

					},
					0
					);

			}
			else {

				if(!this.oElement.parentNode) {
					return;
				}

				this.oElement.parentNode.replaceChild(this.oPasswordReplacerElement, this.oElement);

			}

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

		CLASS_NAME_FOCUSED      : 'zf-focused',
		CLASS_NAME_PLACE_HOLDER : 'zf-placeholder'

	}
	);
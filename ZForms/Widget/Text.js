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

			this.iMaxLength = this.oOptions.iMaxLength?
				this.oOptions.iMaxLength :
				(oElement.maxLength > 0? oElement.maxLength : 0)
				;

			this.bTextArea = this.oElement.tagName.toLowerCase() == 'textarea';
			this.bNeedReplaceType = this.hasPlaceHolder() && this.oElement.type.toLowerCase() == 'password';
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

			if(oValue.isEmpty() && this.bPlaceHolderEnabled) {
				return;
			}

			this.oElement.value = oValue.toStr();

		},

		setValue : function(oValue) {

			if(oValue.isEmpty()) {

				this.updateElementValue(oValue);
				this.enablePlaceHolder();

			}
			else {

				this.disablePlaceHolder();
				this.updateElementValue(this.processValueMaxLength(oValue));

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

			this.oValue = this.processValueMaxLength(this.createValue(this.oElement.value));

			this.__base();

		},

		init : function() {

			if(!this.isTemplate()) {
				this.enablePlaceHolder();
			}

			this.__base();

		},

		focus : function() {

			if(this.oPasswordReplacerElement && this.bPlaceHolderEnabled) {
				this.oPasswordReplacerElement.focus();
			}
			else {
				this.__base();
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

			this.addMaxLengthHandlers();

			Common.Event.add(
				this.oPasswordReplacerElement || this.oElement,
				this.__self.DOM_EVENT_TYPE_FOCUS,
				function() {

					oThis.addClass(oThis.__self.CLASS_NAME_FOCUSED);
					if(oThis.disablePlaceHolder() && Common.Browser.isIE()) {
						//refocus for IE
						oThis.oElement.createTextRange().select();
					}

				}
				);

			Common.Event.add(
				this.oElement,
				this.__self.DOM_EVENT_TYPE_BLUR,
				function() {

					if(oThis.oElement) { // condition for ie
						oThis.removeClass(oThis.__self.CLASS_NAME_FOCUSED);
						oThis.enablePlaceHolder();
					}

				}
				);

			return true;

		},

		addMaxLengthHandlers : function() {

			if(this.iMaxLength == 0) {
				return;
			}

			if(!this.bTextArea) {

				this.oElement.maxLength = this.iMaxLength;
				return;

			}

			var
				oThis = this,
				iKeyDownCode
				;

			// opera 9.5 is really fucking browser
			if(Common.Browser.isOpera() && this.oElement.isSameNode) {
				Common.Event.add(
					this.oElement,
					this.__self.DOM_EVENT_TYPE_KEYDOWN,
					function(oEvent) {

						iKeyDownCode = oEvent.keyCode;

					}
					);
			}

			Common.Event.add(
				this.oElement,
				this.__self.DOM_EVENT_TYPE_KEYPRESS,
				function(oEvent) {

					var oEvent = Common.Event.normalize(oEvent);

					if(oEvent.iKeyCode != 13 && (
							oEvent.ctrlKey ||
							oEvent.metaKey ||
							oEvent.charCode == 0 ||
							oEvent.which == 0 ||
							(iKeyDownCode == oEvent.keyCode && (oEvent.keyCode == 46 || oEvent.keyCode == 45 || oEvent.keyCode == 36 || oEvent.keyCode == 35 || oEvent.keyCode == 9 || oEvent.keyCode == 8))
						)
						) {
						return;
					}

					var iSelectionLength = document.selection?
						document.selection.createRange().text.length :
						oThis.oElement.selectionEnd - oThis.oElement.selectionStart
						;

					if(iSelectionLength <= 0 && oThis.oElement.value.length >= oThis.iMaxLength) {
						Common.Event.cancel(oEvent);
					}

				}
				);

			Common.Event.add(
				this.oElement,
				this.__self.DOM_EVENT_TYPE_PASTE,
				function() {

					setTimeout(
						function() {

							oThis.setValue(oThis.createValue(oThis.oElement.value));

						},
						0
						);

				}
				);

			if(Common.Browser.isOpera()) {
				Common.Event.add(
					this.oElement,
					this.__self.DOM_EVENT_TYPE_BLUR,
					function() {

						oThis.setValue(oThis.createValue(oThis.oElement.value));

					}
					);
			}

		},

		processValueMaxLength : function(oValue) {

			if(this.iMaxLength == 0) {
				return oValue;
			}

			if(oValue.toStr().length > this.iMaxLength) {
				oValue.set(oValue.get().toString().substr(0, this.iMaxLength));
			}

			return oValue;

		},

		enablePlaceHolder : function() {

			if(this.bPlaceHolderEnabled || !this.hasPlaceHolder() || !this.getValue().isEmpty()) {
				return false;
			}

			this.addClass(this.__self.CLASS_NAME_PLACE_HOLDER, this.oPasswordReplacerElement || this.oElement);

			if(!this.bTextArea && this.iMaxLength > 0) {
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

			return true;

		},

		disablePlaceHolder : function() {

			if(!this.bPlaceHolderEnabled || !this.hasPlaceHolder() || !this.getValue().isEmpty()) {
				return false;
			}

			this.removeClass(this.__self.CLASS_NAME_PLACE_HOLDER, this.oElement);

			if(!this.bTextArea && this.iMaxLength > 0) {
				this.oElement.maxLength = this.iMaxLength;
			}

			this.oElement.value = '';

			this.setPasswordAttribute(true);

			if(this.bNeedReplaceType && Common.Browser.isOpera()) {
				this.oElement.focus();
			}

			this.bPlaceHolderEnabled = false;

			return true;

		},

		createPasswordElement : function() {

			if(!this.bNeedReplaceType || !Common.Browser.isIE()) {
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

			if(!this.bNeedReplaceType) {
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

			}
			else {

				if(!this.oElement.parentNode) {
					return;
				}

				this.oElement.parentNode.replaceChild(this.oPasswordReplacerElement, this.oElement);

			}

		},

		addId : function(iIndex) {

			this.__base(iIndex);

			if(this.oPasswordReplacerElement) {
				this.addIdToElement(this.oPasswordReplacerElement, this.__self.ID_PREFIX, iIndex);
			}

		},

		destruct : function() {

			if(this.oPasswordReplacerElement) {
				this.oPasswordReplacerElement = null;
			}

			if(this.oElement) {
				this.disablePlaceHolder();
			}

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
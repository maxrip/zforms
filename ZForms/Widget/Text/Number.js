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
						'name'  : oElement.getAttribute('name'),
						'value' : oElement.value
					}
					),
				oElement
				);

			if(oElement.getAttribute('id')) {
				this.oHiddenElement.setAttribute('id', 'value-' + oElement.getAttribute('id'));
			}

			oElement.removeAttribute('name');

		},

		getName : function() {

			return this.oHiddenElement?
				this.oHiddenElement.name :
				this.oElement.name
				;

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

		compareValueWithInitialValue : function() {

			return this.__base() ||
			   (this.oValue.isEmpty() && this.oInitialValue.isEmpty())
				;

		},

		addExtendedHandlers : function() {

			if(!this.__base()) {
				return;
			}

			var
				oThis = this,
				iKeyDownCode = -1
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

					if(
						oEvent.ctrlKey ||
						oEvent.metaKey  ||
						oEvent.charCode == 0 ||
						oEvent.which == 0 ||
						(iKeyDownCode == oEvent.keyCode && (oEvent.keyCode == 46 || oEvent.keyCode == 45 || oEvent.keyCode == 36 || oEvent.keyCode == 35 || oEvent.keyCode == 9 || oEvent.keyCode == 8)) ||
						(oEvent.iKeyCode >= 48 && oEvent.iKeyCode <= 57) ||
						(oThis.oOptions.bFloat && (oEvent.iKeyCode == 44 || oEvent.iKeyCode == 46) && !/\.|\,/.test(oThis.oElement.value)) ||
						(
							oThis.oOptions.bNegative &&
						 	oEvent.iKeyCode == 45 &&
						 	oThis.oElement.value.charAt(0) != '-' &&
						 	oThis.getCursorPosition() == 0
						)
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

		getCursorPosition : function() {

			if('selectionStart' in this.oElement) {
				return this.oElement.selectionStart;
			}


			if(document.selection) {

				var oRange = document.selection.createRange();

				if(!oRange) {
					return 0;
				}

				var
					oInputRange = this.oElement.createTextRange(),
					oDuplicateRange = oInputRange.duplicate()
					;

				oInputRange.moveToBookmark(oRange.getBookmark());
				oDuplicateRange.setEndPoint('EndToStart', oInputRange);
				return oDuplicateRange.text.length;

			}

			return 0;

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

			if(!this.bPlaceHolderEnabled) {
				this.setValue(this.getValue());
			}

		},

		destruct : function() {

			this.oHiddenElement = null;

			this.__base();

		}

	}
	);
ZForms.Widget.Container.Date = ZForms.Widget.Container.inheritTo(
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

			if(this.isTemplate()) {
				return;
			}

			this.oDayInput = this.createNumberInput('day', 2, this.oOptions.oPlaceHolders.sDay);
			this.oMonthInput = this.createMonthInput('month');
			this.oYearInput = this.createNumberInput('year', 4, this.oOptions.oPlaceHolders.sYear);

			if(this.oOptions.bWithTime) {

				this.oHourInput = this.createNumberInput('hour', 2, this.oOptions.oPlaceHolders.sHour);
				this.oMinuteInput = this.createNumberInput('minute', 2, this.oOptions.oPlaceHolders.sMinute);
				this.oSecondInput = this.createNumberInput('second', 2, this.oOptions.oPlaceHolders.sSecond);

			}

			this.addChild(this.oDayInput);
			this.addChild(this.oMonthInput);
			this.addChild(this.oYearInput);

			if(this.oOptions.bWithTime) {

				this.addChild(this.oHourInput);
				this.addChild(this.oMinuteInput);
				this.addChild(this.oSecondInput);

			}

			this.replaceElement();

			this.setValueFromElement();

			this.addExtendedHandlers();

			this.initValue();

			this.oCalendar = this.oOptions.oPickerOpenerElement? new ZForms.Calendar(this) : null;

		},

		getDefaultOptions : function() {

			return Common.Object.extend(
				this.__base(),
				{
					bWithTime     : false,
					bOnlyMonths   : false,
					oPlaceHolders : {
						sDay    : '',
						sYear   : '',
						sHour   : '',
						sMinute : '',
						sSecond : ''
					}
				},
				true
				);

		},

		createValue : function(mValue) {

			return this.oOptions.bWithTime?
				new ZForms.Value.Date.Time(mValue) :
				new ZForms.Value.Date(mValue)
				;

		},

		hasValue : function() {

			return true;

		},

		setValue : function(oValue) {

			var
				oValueDay  = this.oDayInput.createValue(oValue.getDay()),
				oValueYear = this.oYearInput.createValue(oValue.getYear())
				;

			if((this.oYearInput.getValue().isEmpty() || !oValueYear.isEmpty()) && !oValueYear.isEqual(this.oYearInput.getValue())) {
				this.oYearInput.setValue(oValueYear);
			}

			this.oMonthInput.setValue(this.oMonthInput.createValue(oValue.getMonth()));

			if((this.oDayInput.getValue().isEmpty() || !oValueDay.isEmpty()) && !oValueDay.isEqual(this.oDayInput.getValue())) {
				this.oDayInput.setValue(oValueDay);
			}

			if(this.oOptions.bWithTime) {

				var
					oValueHour   = this.oHourInput.createValue(oValue.getHour()),
					oValueMinute = this.oMinuteInput.createValue(oValue.getMinute()),
					oValueSecond = this.oSecondInput.createValue(oValue.getSecond())
					;

				if((this.oHourInput.getValue().isEmpty() || !oValueHour.isEmpty()) && !oValueHour.isEqual(this.oHourInput.getValue())) {
					this.oHourInput.setValue(oValueHour);
				}

				if((this.oMinuteInput.getValue().isEmpty() || !oValueMinute.isEmpty()) && !oValueMinute.isEqual(this.oMinuteInput.getValue())) {
					this.oMinuteInput.setValue(oValueMinute);
				}

				if((this.oSecondInput.getValue().isEmpty() || !oValueSecond.isEmpty()) && !oValueSecond.isEqual(this.oSecondInput.getValue())) {
					this.oSecondInput.setValue(oValueSecond);
				}

			}

			this.oElement.value = oValue.toStr();

			this.__base(oValue);

		},

		isRequired : function() {

			return ZForms.Widget.prototype.isRequired.call(this);

		},

		isValid : function() {

			return ZForms.Widget.prototype.isValid.call(this);

		},

		isChanged : function() {

			return ZForms.Widget.prototype.isChanged.call(this);

		},

		replaceElement : function() {

			var oNewElement = Common.Dom.createElement(
				'input',
				{
					'type'  : 'hidden',
					'id'    : this.oElement.getAttribute('id'),
					'name'  : this.oElement.getAttribute('name'),
					'value' : this.oElement.value
				}
				);

			this.oElement.parentNode.replaceChild(oNewElement, this.oElement);

			this.oElement = oNewElement;

		},

		addExtendedHandlers : function() {

			if(this.isTemplate()) {
				return;
			}

			var
				oThis = this,
				aWidgets = this.oOptions.bWithTime?
					[this.oDayInput.oElement, this.oMonthInput.oElement, this.oYearInput.oElement, this.oHourInput.oElement, this.oMinuteInput.oElement, this.oSecondInput.oElement] :
					[this.oDayInput.oElement, this.oMonthInput.oElement, this.oYearInput.oElement]
				;

			Common.Event.add(
				aWidgets,
				this.__self.DOM_EVENT_TYPE_BLUR,
				function() {

					oThis.processDate();

				}
				);

			Common.Event.add(
				aWidgets,
				this.__self.DOM_EVENT_TYPE_KEYDOWN,
				function(oEvent) {

					if(Common.Event.normalize(oEvent).iKeyCode == oThis.__self.KEY_CODE_ENTER) {
						oThis.processDate();
					}

				}
				);

		},

		processDate : function() {

			var
				iYear   = this.oYearInput.getValue().get(),
				iMonth  = this.oMonthInput.getValue().get(),
				iDay    = this.oDayInput.getValue().isEmpty() && this.oOptions.bOnlyMonths? 1 : this.oDayInput.getValue().get(),
				iHour   = this.oOptions.bWithTime? this.oHourInput.getValue().get() : 0,
				iMinute = this.oOptions.bWithTime? this.oMinuteInput.getValue().get() : 0,
				iSecond = this.oOptions.bWithTime? this.oSecondInput.getValue().get() : 0
				;

			this.setValue(
				this.createValue(this.oOptions.bWithTime?
					iYear + '-' + iMonth + '-' + iDay + ' ' + iHour + ':' + iMinute + ':' + iSecond :
					iYear + '-' + iMonth + '-' + iDay
					)
				);

		},

		createNumberInput : function(sPrefix, iSize, sPlaceHolder) {

			var oResult = ZForms.createNumberInput(
				this.oElement.parentNode.insertBefore(
					Common.Dom.createElement(
						'input',
						{
							'type'      : this.oOptions.bOnlyMonths && sPrefix == 'day'? 'hidden' : 'text',
							'id'        : this.oElement.id? sPrefix + '-' + this.oElement.id : '',
							'size'      : iSize,
							'maxlength' : iSize,
							'class'     : 'zf-input-' + sPrefix
						}
						),
					this.oElement
				),
				null,
				{
					sPlaceHolder : sPlaceHolder
				}
				);

			oResult.checkForInitialValueChanged = function() {

				return false;

			};

			return oResult;

		},

		createMonthInput : function(sPrefix) {

			var
				oElement = Common.Dom.createElement(
					'select',
					{
						'id'    : this.oElement.id? sPrefix + '-' + this.oElement.id : '',
						'class' : 'zf-input-' + sPrefix
					}
					),
				aMonths = this.oOptions.bOnlyMonths?
					ZForms.Resources.getMonthsByType('normal') :
					ZForms.Resources.getMonthsByType('genitive')
				;

			/* IE hack */
			document.body.appendChild(oElement);

			oElement.options.length = 0;

			for(var i = 0; i < aMonths.length; i++) {
				oElement.options[oElement.options.length] = new Option(aMonths[i], i + 1);
			}

			var oResult = ZForms.createSelectInput(this.oElement.parentNode.insertBefore(document.body.removeChild(oElement), this.oElement));

			oResult.checkForInitialValueChanged = function() {

				return false;

			};

			return oResult;

		},

		setValueFromElement : function() {

			if(this.isTemplate() || !this.oYearInput) {
				return;
			}

			this.oValue.set(this.oYearInput.getValue().get() + '-' + this.oMonthInput.getValue().get() + '-' + (this.oOptions.bOnlyMonths && this.oDayInput.getValue().isEmpty()? 1 : this.oDayInput.getValue().get()) + (this.oOptions.bWithTime? ' ' + this.oHourInput.getValue().get() + ':' + this.oMinuteInput.getValue().get() + ':' + this.oSecondInput.getValue().get() : ''));

			ZForms.Widget.prototype.setValueFromElement.call(this);

		},

		initValue : function() {

			this.oInitialValue = this.createValue(this.oElement.value);

			this.setValue(this.oInitialValue.clone());

			this.oDayInput.oInitialValue = this.oDayInput.createValue(this.oValue.getDay());
			this.oMonthInput.oInitialValue = this.oMonthInput.createValue(this.oValue.getMonth() || 1);
			this.oYearInput.oInitialValue = this.oYearInput.createValue(this.oValue.getYear());

			if(this.oOptions.bWithTime) {

				this.oHourInput.oInitialValue = this.oHourInput.createValue(this.oValue.getHour());
				this.oMinuteInput.oInitialValue = this.oMinuteInput.createValue(this.oValue.getMinute());
				this.oSecondInput.oInitialValue = this.oSecondInput.createValue(this.oValue.getSecond());

			}

			if(!this.getValue().isEmpty()) {
				this.addClass(this.__self.CLASS_NAME_SELECTED_INITIAL, this.oMonthInput.oElement.options[this.oMonthInput.oElement.selectedIndex]);
			}

		},

		disable : function(bByParent) {

			if(this.__base(bByParent)) {
				return false;
			}

			if(this.oCalendar) {
				this.oCalendar.disable();
			}

			return true;

		},

		enable : function(bByParent) {

			if(this.__base(bByParent)) {
				return false;
			}

			if(this.oCalendar) {
				this.oCalendar.enable();
			}

			return true;

		},

		addId : function(iIndex) {

			this.__base(iIndex);

			if(this.oOptions.oPickerOpenerElement) {
				this.addIdToElement(this.oOptions.oPickerOpenerElement, 'opener-', iIndex);
			}

		},


		clone : function(
			oElement,
			oClassElement,
			iIndex
			) {
			
			return new this.__self(
				oElement,
				oClassElement,
				Common.Object.extend(
					{
						oPickerOpenerElement : this.oOptions.oPickerOpenerElement? document.getElementById(this.oOptions.oPickerOpenerElement.id.match(ZForms.Widget.Container.Multiplicator.REG_EXP_REPLACE)[1] + '_' + iIndex) : null,
						bTemplate            : false
					},
					this.oOptions
					)
				);

		},

		destruct: function() {

			this.__base();

			if(this.oCalendar) {
				this.oCalendar.destruct();
			}

		}

	}
	);
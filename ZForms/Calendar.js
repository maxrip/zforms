ZForms.Calendar = Abstract.inheritTo(
	{

		__constructor : function(oWidget) {

			this.oWidget = oWidget;

			this.oPickerButton = ZForms.createButton(oWidget.oOptions.oPickerOpenerElement);
			this.oElement = Common.Dom.createElement('table', { 'class' : this.__self.CLASS_NAME_CALENDAR + ' ' + this.__self.CLASS_NAME_HIDDEN }).appendChild(Common.Dom.createElement('tbody'));
			this.oYearTitleElement = Common.Dom.createElement('span', { 'class' : this.__self.CLASS_NAME_TITLE });
			this.oMonthTitleElement = Common.Dom.createElement('span', { 'class' : this.__self.CLASS_NAME_TITLE });

			this.oDate = new Date();
			this.oDateNow = new Date();
			this.bShowed = false;
			this.fClickHandler = null;
			this.fMouseHandler = null;

			this.init();

		},

		init : function() {

			var
				oHeadElement = this.oElement.parentNode.insertBefore(document.createElement('thead'), this.oElement),
				oYearRowElement = oHeadElement.appendChild(document.createElement('tr')).appendChild(Common.Dom.createElement('th',  { 'colspan' : 7 } )),
				oYearArrowPrevElement = oYearRowElement.appendChild(Common.Dom.createElement('input', { 'type' : 'button', 'value' : '←', 'class' : this.__self.CLASS_NAME_ARROW_PREV + ' ' + ZForms.Widget.Button.CLASS_NAME_BUTTON })),
				oYearArrowNextElement = oYearRowElement.appendChild(Common.Dom.createElement('input', { 'type' : 'button', 'value' :  '→', 'class' : this.__self.CLASS_NAME_ARROW_NEXT+ ' ' + ZForms.Widget.Button.CLASS_NAME_BUTTON })),
				oMonthRowElement = oHeadElement.appendChild(document.createElement('tr')).appendChild(Common.Dom.createElement('th',  { 'colspan' : 7 })),
				oMonthArrowPrevElement = oMonthRowElement.appendChild(Common.Dom.createElement('input', { 'type' : 'button', 'value' : '←', 'class' : this.__self.CLASS_NAME_ARROW_PREV + ' ' + ZForms.Widget.Button.CLASS_NAME_BUTTON })),
				oMonthArrowNextElement = oMonthRowElement.appendChild(Common.Dom.createElement('input', { 'type' : 'button', 'value' :  '→', 'class' : this.__self.CLASS_NAME_ARROW_NEXT + ' ' + ZForms.Widget.Button.CLASS_NAME_BUTTON })),
				oDaysOfWeekRowElement = oHeadElement.appendChild(document.createElement('tr'))
				;

			oYearRowElement.appendChild(this.oYearTitleElement);
			oMonthRowElement.appendChild(this.oMonthTitleElement);

			for(var i = 0; i < 7; i++) {
				oDaysOfWeekRowElement.appendChild(
					Common.Dom.createElement(
						'th',
						{ 'class' : i > 4? this.__self.CLASS_NAME_WEEKEND : null },
						ZForms.Resources.getDaysOfWeek()[i]
						)
					);
			}

			var oThis = this;

			this.oPickerButton.setHandler(
				function() {

					if(oThis.isShowed()) {
						oThis.hide();
					}
					else {

						var oWidgetValue = oThis.oWidget.getValue();

						if(oThis.oWidget.oOptions.bWithTime && oWidgetValue.isEmpty() && !oThis.oWidget.oYearInput.getValue().isEmpty()) {
							oThis.setDate(new Date(oThis.oWidget.oYearInput.getValue().get(), oThis.oWidget.oMonthInput.getValue().get(), oThis.oWidget.oDayInput.getValue().get()));
						}
						else if(!oWidgetValue.isEmpty()) {
							oThis.setDate(new Date(oWidgetValue.getYear(), oWidgetValue.getMonth() - 1, oWidgetValue.getDay()));
						}

						oThis.show();

					}

				}
				);

			Common.Event.add(
				this.oElement.parentNode,
				'click',
				function(oEvent) {

					Common.Event.cancel(oEvent);

				}
				);

			Common.Event.add(
				document,
				'click',
				function(oEvent) {

					if(Common.Event.normalize(oEvent).target != oThis.oPickerButton.oElement) {
						oThis.hide();
					}

				}
				);

			Common.Event.add(
				oYearArrowPrevElement,
				'click',
				function() {

					oThis.setPrevYear();

				}
				);

			Common.Event.add(
				oYearArrowNextElement,
				'click',
				function() {

					oThis.setNextYear();

				}
				);


			Common.Event.add(
				oMonthArrowPrevElement,
				'click',
				function() {

					oThis.setPrevMonth();

				}
				);

			Common.Event.add(
				oMonthArrowNextElement,
				'click',
				function() {

					oThis.setNextMonth();

				}
				);

			this.oPickerButton.oElement.parentNode.appendChild(this.oElement.parentNode);

			this.fClickHandler = function(oEvent) {

				oThis.hide();

				var
					oTarget = Common.Event.normalize(oEvent).target,
					iDay = parseInt(oTarget.innerHTML, 10)
					;

				oThis.setDate(
					new Date(
						oThis.oDate.getFullYear(),
						oThis.oDate.getMonth() + (Common.Class.match(oTarget, oThis.__self.CLASS_NAME_ADD)? (iDay > 15? -1 : 1) : 0),
						oTarget.innerHTML
						)
					);

				if(oThis.oWidget.oOptions.bWithTime) {

					oThis.oDate.setHours(oThis.oWidget.oHourInput.getValue().isEmpty()? 0 : oThis.oWidget.oHourInput.getValue().get());
					oThis.oDate.setMinutes(oThis.oWidget.oMinuteInput.getValue().isEmpty()? 0 : oThis.oWidget.oMinuteInput.getValue().get());
					oThis.oDate.setSeconds(oThis.oWidget.oSecondInput.getValue().isEmpty()? 0 : oThis.oWidget.oSecondInput.getValue().get());

				}

				oThis.oWidget.setValue(oThis.oWidget.createValue(oThis.oDate));

			};

			this.fMouseHandler = function(oEvent) {

				if(Common.Browser.isOpera()) {

					oEvent.target.style.display = 'none';
					oEvent.target.style.display = 'table-cell';

				}
				else {

					var oEvent = Common.Event.normalize(oEvent);

					Common.Class[oEvent.type == 'mouseover'? 'add' : 'remove'](oEvent.target, oThis.__self.CLASS_NAME_HOVERED);

				}


			};


		},

		setDate : function(oDate) {

			this.oDate = oDate;

			if(this.isShowed()) {
				this.render();
			}

		},

		isShowed : function() {

			return this.bShowed;

		},

		show : function() {

			if(this.isShowed()) {
				return;
			}

			this.render();

			this.oWidget.addClass(this.__self.CLASS_NAME_PICKER_ACTIVE);

			Common.Class.remove(this.oElement.parentNode, this.__self.CLASS_NAME_HIDDEN);

			this.bShowed = true;

		},

		hide : function() {

			if(!this.isShowed()) {
				return;
			}

			Common.Class.add(this.oElement.parentNode, this.__self.CLASS_NAME_HIDDEN);

			this.oWidget.removeClass(this.__self.CLASS_NAME_PICKER_ACTIVE);

			this.bShowed = false;

		},

		render : function() {

			this.oYearTitleElement.innerHTML = this.oDate.getFullYear();
			this.oMonthTitleElement.innerHTML = ZForms.Resources.getMonthsByType('normal')[this.oDate.getMonth()];

			var
				oFirstDayInMonth = new Date(this.oDate.getFullYear(), this.oDate.getMonth(), 1),
				iCountDaysInPrevMonth = new Date(this.oDate.getFullYear(), this.oDate.getMonth(), -0.5).getDate(),
				iCountShowedDaysInPrevMonth = (oFirstDayInMonth.getDay() == 0? 7 : oFirstDayInMonth.getDay()) - 1,
				oLastDayInMonth = new Date(this.oDate.getFullYear(), this.oDate.getMonth() + 1, -0.5),
				iCountShowedDaysInNextMonth = 7 - (oLastDayInMonth.getDay() == 0? 7 : oLastDayInMonth.getDay()),
				oBuffer = new Common.Utils.StringBuffer('<table>')
				;

			for(var i = 1; i <= iCountShowedDaysInPrevMonth; i++) {

				if(i % 7 == 1) {
					oBuffer.append(i > 1? '</tr>' : '').append('<tr>');
				}

				oBuffer
					.append('<td class="')
					.append(this.__self.CLASS_NAME_ADD)
					.append('"')
					.append(i % 7 == 6 || i % 7 == 0? ' ' + this.__self.CLASS_NAME_WEEKEND : '')
					.append('">')
					.append(iCountDaysInPrevMonth - iCountShowedDaysInPrevMonth + i)
					.append('</td>')
					;

			}

			for(var i = iCountShowedDaysInPrevMonth + 1, iCountDays = oLastDayInMonth.getDate(), iDay = 1, sClassName; iDay <= iCountDays; i++) {

				if(i % 7 == 1) {
					oBuffer.append('</tr><tr>');
				}

				sClassName = '';

				if(iDay == this.oDateNow.getDate() && this.oDate.getMonth() == this.oDateNow.getMonth() && this.oDate.getYear() == this.oDateNow.getYear()) {
					sClassName = this.__self.CLASS_NAME_NOW;
				}

				if(i % 7 == 6 || i % 7 == 0) {
					sClassName += (sClassName.length > 0? ' ' : '') + this.__self.CLASS_NAME_WEEKEND;
				}

				oBuffer.append('<td');

				if(sClassName.length > 0) {
					oBuffer
						.append(' class="')
						.append(sClassName)
						.append('"')
						;
				}

				oBuffer
					.append('>')
					.append(iDay++)
					.append('</td>')
					;

			}

			for(var i = iCountShowedDaysInPrevMonth + iCountDays + 1, iDay = 1; iDay <= iCountShowedDaysInNextMonth; i++) {

				if(i % 7 == 1) {
					oBuffer.append('</tr><tr>');
				}

				oBuffer
					.append('<td class="')
					.append(this.__self.CLASS_NAME_ADD)
					.append(i % 7 == 6 || i % 7 == 0? ' ' + this.__self.CLASS_NAME_WEEKEND : '')
					.append('">')
					.append(iDay++)
					.append('</td>')
					;

			}

			oBuffer.append('</tr></table>');

			// fucking ie

			var oBodyElement = document.createElement('div');
			oBodyElement.innerHTML = oBuffer.get();
			oBodyElement = oBodyElement.getElementsByTagName('tbody')[0];

			Common.Event.remove(
				this.oElement,
				'click',
				this.fClickHandler
				);

			Common.Event.add(
				oBodyElement,
				'click',
				this.fClickHandler
				);

			if(Common.Browser.isOpera() || (Common.Browser.isIE() && (!document.compatMode || document.compatMode == 'BackCompat' || !window.XMLHttpRequest))) {

				var aCells = this.oElement.getElementsByTagName('td');

				for(var i = 0; i < aCells.length; i++) {
					Common.Event.remove(
						aCells[i],
						['mouseover', 'mouseout'],
						this.fMouseHandler
						);
				}

				aCells = oBodyElement.getElementsByTagName('td');

				for(var i = 0; i < aCells.length; i++) {
					Common.Event.add(
						aCells[i],
						['mouseover', 'mouseout'],
						this.fMouseHandler
						);
				}

			}

			this.oElement.parentNode.replaceChild(oBodyElement, this.oElement);

			this.oElement = oBodyElement;

		},

		setPrevMonth : function() {

			this.setDate(new Date(this.oDate.getFullYear(), this.oDate.getMonth(), -0.5));

		},

		setNextMonth : function() {

			this.setDate(new Date(this.oDate.getFullYear(), this.oDate.getMonth(), 33));

		},

		setPrevYear : function() {

			this.setDate(new Date(this.oDate.getFullYear() - 1, this.oDate.getMonth(), 1));

		},

		setNextYear : function() {

			this.setDate(new Date(this.oDate.getFullYear() + 1, this.oDate.getMonth(), 1));

		},

		enable : function() {

			this.oPickerButton.enable();

		},

		disable : function() {

			this.hide();
			this.oPickerButton.disable();

		},

		destruct : function() {

			this.oWidget = null;
			this.oElement = null;
			this.oYearTitleElement = null;
			this.oMonthTitleElement = null;

			this.oPickerButton.destruct();

		}

	},
	{

		CLASS_NAME_CALENDAR      : 'zf-calendar',
		CLASS_NAME_HIDDEN        : ZForms.Widget.CLASS_NAME_HIDDEN,
		CLASS_NAME_ARROW_PREV    : 'zf-buttonprev',
		CLASS_NAME_ARROW_NEXT    : 'zf-buttonnext',
		CLASS_NAME_TITLE         : 'zf-title',
		CLASS_NAME_WEEKEND       : 'zf-weekend',
		CLASS_NAME_NOW           : 'zf-now',
		CLASS_NAME_ADD           : 'zf-add',
		CLASS_NAME_PICKER_ACTIVE : 'zf-picker-active',
		CLASS_NAME_HOVERED       : 'zf-hovered'

	}
	);
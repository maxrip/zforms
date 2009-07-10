ZForms.Widget.Container.Slider = ZForms.Widget.Container.inheritTo(
	{

		__constructor : function(
			oElement,
			oClassElement,
			oOptions
			) {

			oOptions = oOptions || {};

			this.aSlideRules = oOptions.aSlideRules || this.getDefaultOptions().aSlideRules;

			this.dMin = this.aSlideRules[0].dValue;
			this.dMax = this.aSlideRules[this.aSlideRules.length - 1].dValue;

			this.__base(
				oElement,
				oClassElement,
				oOptions
				);

			if(this.isTemplate()) {
				return;
			}

			this.aSlideRules[0].dPercent = 0;
			this.aSlideRules[this.aSlideRules.length - 1].dPercent = 100;

			var oSliderElements = this.createElements(oElement);

			this.oContainer = oSliderElements.oContainer;
			this.oScaleElement = oSliderElements.oScaleElement;
			this.aControls = [];

			this.aMarks = this.createMarks(oSliderElements.oScaleElement);

			this.bEnabled = true;

			this.iLastControlPosition = 0;
			this.iCurrentControlIndex = -1;

			this.iFocusedChildIndex = -1;

			this.oContainerOffset = null;

			this.fClickHandler = null;
			this.fDragStartHandler = null;
			this.fDragHandler = null;
			this.fDragEndHandler = null;
			this.fNullHandler = null;
			this.fSyncHandler = null;

			this.addExtendedHandlers();

			this.iIndex = this.__self.add(this);

			this.oLastProcessedValue = null;

		},

		getDefaultOptions : function() {

			return Common.Object.extend(
				this.__base(),
				{
					aSlideRules : [
						{
							dValue   : 0,
							dPercent : 0,
							dStep    : 1,
							sLabel   : '0'
						},
						{
							dValue   : 100,
							dPercent : 100,
							dStep    : 1,
							sLabel   : '100'
						}
					]
				},
				true
				);

		},

		createElements : function(oElement) {

			var	oResult = {
				oContainer      : document.createElement('div'),
				oScaleElement   : document.createElement('div'),
				aMarkElements   : []
				};

			Common.Class.add(oResult.oContainer, this.__self.CLASS_NAME_SLIDER);
			Common.Class.add(oResult.oScaleElement, this.__self.CLASS_NAME_SLIDER_SCALE);

			oResult.oContainer.appendChild(oResult.oScaleElement);

			oElement.insertBefore(oResult.oContainer, oElement.firstChild);

			return oResult;

		},

		createMarks : function(oContainer) {

			var aResult = [];

			for(var i = 0, oElement; i < this.aSlideRules.length; i++) {

				oElement = document.createElement('div');

				Common.Class.add(oElement, this.__self.CLASS_NAME_MARK_ELEMENT + ' ' + this.__self.CLASS_NAME_MARK_ELEMENT + '-' + this.aSlideRules[i].dValue);

				this.setupMarkElementPosition(
					oElement,
					this.aSlideRules[i].dPercent
					);

				if(typeof this.aSlideRules[i].sLabel != 'undefined') {
					oElement.innerHTML = '<span>' + this.aSlideRules[i].sLabel + '</span>';
				}

				oContainer.appendChild(oElement);

				aResult.push(
					{
						oElement  : oElement,
						dValue    : this.aSlideRules[i].dValue,
						bSelected : false
					}
					);

			}

			return aResult;

		},

		setupMarkElementPosition : function(
			oElement,
			dPercent
			) {

			oElement.style.left = dPercent + '%';

		},

		createControl : function(
			sPostfixId,
			oContainer
			) {

			var
				oResult = {
					oElement : document.createElement('div'),
					oValueElement : document.createElement('div')
					},
				oThis = this,
				iIndex = this.getChildren().length - 1
				;

			if(sPostfixId) {
				oResult.oElement.id = 'control-' + sPostfixId;
			}

			Common.Class.add(oResult.oElement, this.__self.CLASS_NAME_CONTROL_ELEMENT + ' ' + this.__self.CLASS_NAME_CONTROL_ELEMENT + '-' + iIndex);
			Common.Class.add(oResult.oValueElement, this.__self.CLASS_NAME_VALUE_ELEMENT);

			oContainer.appendChild(oResult.oElement);
			oContainer.appendChild(oResult.oValueElement);

			Common.Event.add(
				oResult.oElement,
				this.__self.DOM_EVENT_TYPE_MOUSEDOWN,
				function(oEvent) {

					if(oThis.iFocusedChildIndex > -1) {
						oThis.aChildren[oThis.iFocusedChildIndex].oElement.blur();
					}

					Common.Event.cancel(oEvent);

					oThis.__self.setActiveIndex(oThis.iIndex);
					oThis.fDragStartHandler(iIndex);

				}
				);

			return oResult;

		},

		createRangeElements : function(iControlIndex) {

			this.aControls[iControlIndex].oLeftRangeElement = iControlIndex == 0?
				this.createRangeElement(iControlIndex) :
				this.aControls[iControlIndex - 1].oRightRangeElement
				;

			this.aControls[iControlIndex].oRightRangeElement = this.createRangeElement(iControlIndex + 1);

		},

		createRangeElement : function(iIndex) {

			var oResult = document.createElement('div');

			Common.Class.add(
				oResult,
				this.__self.CLASS_NAME_RANGE_ELEMENT + ' ' + this.__self.CLASS_NAME_RANGE_ELEMENT + '-' + iIndex
				);

			this.oContainer.insertBefore(oResult, this.oScaleElement);

			return oResult;

		},

		addChild : function(
			oChild,
			iIndex
			) {

			if(!(oChild instanceof ZForms.Widget.Text.Number)) {
				return;
			}

			var oResult = this.__base(
				oChild,
				iIndex
				);

			if(this.isTemplate()) {
				return oResult;
			}

			var oControlElements =
				this.createControl(
					oChild.oElement.id,
					this.oContainer
					);

			this.aControls.push(
				{
					oElement      : oControlElements.oElement,
					oValueElement : oControlElements.oValueElement,
					dPosition     : null,
					bSelected     : false
				});

			this.createRangeElements(
				this.aControls.length - 1,
				this.oContainer
				);

			var
				oThis = this,
				iIndex = this.getChildren().length - 1
				;

			Common.Event.add(
				oChild.oElement,
				this.__self.DOM_EVENT_TYPE_FOCUS,
				function() {

					oThis.iFocusedChildIndex = iIndex;

				}
				);

			Common.Event.add(
				oChild.oElement,
				this.__self.DOM_EVENT_TYPE_BLUR,
				function() {

					oThis.iFocusedChildIndex = -1;
					oThis.fSyncHandler(iIndex);

				}
				);

			oChild.setValue = function(oValue, bForceSync) {

				if(oValue.isGreater(oThis.getMax())) {
					oValue.set(oThis.getMax());
				}
				else if(oValue.isLess(oThis.getMin())) {
					oValue.set(oThis.getMin());
				}

				ZForms.Widget.Text.Number.prototype.setValue.call(oChild, oValue);

				if(!bForceSync) {
					oThis.fSyncHandler(iIndex);
				}

			};

			oChild.disable = function(bByParent) {

				if(!ZForms.Widget.prototype.disable.call(this, bByParent)) {
					return false;
				}

				oThis.disableControlByIndex(iIndex);

			};

			oChild.enable = function(bByParent) {

				if(!ZForms.Widget.prototype.enable.call(this, bByParent)) {
					return false;
				}

				oThis.enableControlByIndex(iIndex);

			};

			this.setCurrentControlIndex(iIndex);

			this.setValue(oChild.getValue());

			return oResult;

		},

		addExtendedHandlers : function() {

			var oThis = this;

			this.fClickHandler = function(oEvent) {

				var
					oEvent = Common.Event.normalize(oEvent),
					iNearestControlIndex = oThis.getNearestControlIndex(oEvent)
					;

				if(iNearestControlIndex < 0) {
					return iNearestControlIndex;
				}

				oThis.__self.setActiveIndex(oThis.iIndex);
				oThis.setCurrentControlIndex(iNearestControlIndex);

				oThis.drag(oEvent);

				return iNearestControlIndex;

			};

			this.fDragStartHandler = function(iControlIndex) {

				oThis.dragStart(iControlIndex);

			};

			this.fDragHandler = function(oEvent) {

				oThis.drag(Common.Event.normalize(oEvent));

			};

			this.fDragEndHandler = function(oEvent) {

				oThis.dragEnd(Common.Event.normalize(oEvent));

			};

			this.fNullHandler = function(oEvent) {

				Common.Event.cancel(oEvent);

			};

			this.fSyncHandler = function(iControlIndex) {

				oThis.setCurrentControlIndex(iControlIndex);
				oThis.setValue(oThis.getChildren()[iControlIndex].getValue(), true);

			};

			Common.Event.add(
				this.oContainer,
				this.__self.DOM_EVENT_TYPE_MOUSEDOWN,
				function(oEvent) {

					Common.Event.cancel(oEvent);

					if(oThis.iFocusedChildIndex > -1) {
						oThis.aChildren[oThis.iFocusedChildIndex].oElement.blur();
					}

					var iNearestControlIndex = oThis.fClickHandler(oEvent);

					if(iNearestControlIndex >= 0) {
						oThis.fDragStartHandler(iNearestControlIndex);
					}

				}
				);

		},

		getMin : function() {

			return this.dMin;

		},

		getMax : function() {

			return this.dMax;

		},

		getCurrentControl : function() {

			return this.aControls[this.iCurrentControlIndex];

		},

		getCurrentControlIndex : function() {

			return this.iCurrentControlIndex;

		},

		setCurrentControlIndex : function(iIndex) {

			if(this.getCurrentControlIndex() == iIndex) {
				return;
			}

			if(this.getCurrentControlIndex() > -1) {
				Common.Class.remove(
					this.getCurrentControl().oElement,
					this.__self.CLASS_NAME_CONTROL_ELEMENT_SELECTED
					);
			}

			this.iCurrentControlIndex = iIndex;

			Common.Class.add(
				this.getCurrentControl().oElement,
				this.__self.CLASS_NAME_CONTROL_ELEMENT_SELECTED
				);

		},

		getNearestControlIndex : function(oEvent) {

			this.updateContainerOffset();

			var
				oValue = this.calculateValueByOffset(this.calculateOffset(oEvent)),
				iResult = -1,
				dMinDifference = Math.abs(this.getMax() - this.getMin()),
				i = 0,
				oChild,
				dDifference
				;

			while(oChild = this.aChildren[i++]) {

				if(!oChild.isEnabled()) {
					continue;
				}

				dDifference = Math.abs(oChild.getValue().get() - oValue.get());

				if(dDifference < dMinDifference || (Math.abs(dDifference - dMinDifference) < 0.00001 && oChild.getValue().get() < oValue.get())) {

					dMinDifference = dDifference;
					iResult = i - 1;

				}

			}

			return iResult;

		},

		dragStart : function(iControlIndex) {

			if(!this.isEnabled() || !this.getChildren()[iControlIndex].isEnabled()) {
				return false;
			}

			this.setCurrentControlIndex(iControlIndex);

			this.updateContainerOffset();

			Common.Event.add(
				document,
				this.__self.DOM_EVENT_TYPE_SELECTSTART,
				this.fNullHandler
				);

			Common.Event.add(
				document,
				this.__self.DOM_EVENT_TYPE_MOUSEMOVE,
				this.fDragHandler
				);

			Common.Event.add(
				document,
				this.__self.DOM_EVENT_TYPE_MOUSEUP,
				this.fDragEndHandler
				);

		},

		drag : function(oEvent) {

			if(!this.isEnabled()) {
				return false;
			}

			this.updateContainerOffset();

			this.setValue(this.calculateValueByOffset(this.calculateOffset(oEvent)));

		},

		dragEnd : function() {

			Common.Event.remove(
				document,
				this.__self.DOM_EVENT_TYPE_MOUSEMOVE,
				this.fDragHandler
				);

			Common.Event.remove(
				document,
				this.__self.DOM_EVENT_TYPE_MOUSEUP,
				this.fDragEndHandler
				);

			Common.Event.remove(
				document,
				this.__self.DOM_EVENT_TYPE_SELECTSTART,
				this.fNullHandler
				);

		},

		setValue : function(
			oValue,
			bUpdateSiblings
			) {

			if(!this.getCurrentControl()) {
				return;
			}

			var
				iSliderRuleIndex = this.findSlideRuleIndexByValue(oValue),
				oSlideRule = this.getSlideRuleByIndex(iSliderRuleIndex),
				oPrevSlideRule = this.getSlideRuleByIndex(iSliderRuleIndex - 1),
				oNextSlideRule = this.getSlideRuleByIndex(iSliderRuleIndex + 1),
				dNewValue = parseFloat((Math.round((oValue.get() - oSlideRule.dValue) / oSlideRule.dStep) * oSlideRule.dStep + oSlideRule.dValue).toFixed(8)),
				oPrevControlWidget = this.getChildren()[this.getCurrentControlIndex() - 1],
				oNextControlWidget = this.getChildren()[this.getCurrentControlIndex() + 1],
				oChild
				;

			if(oPrevSlideRule && dNewValue < oPrevSlideRule.dValue) {
				dNewValue = oPrevSlideRule.dValue;
			}
			else if(oNextSlideRule && dNewValue > oNextSlideRule.dValue) {
				dNewValue = oNextSlideRule.dValue;
			}

			if(dNewValue < this.getMin()) {
				dNewValue = this.getMin();
			}

			if(oPrevControlWidget && oPrevControlWidget.getValue().get() > dNewValue) {

				if(bUpdateSiblings && this.getChildren()[this.getCurrentControlIndex() - 1].isEnabled()) {

					oChild = this.getChildren()[this.getCurrentControlIndex()];

					oChild.setValue(oChild.createValue(parseFloat(dNewValue)), true);

					--this.iCurrentControlIndex;
					this.setValue(oChild.createValue(parseFloat(dNewValue)), bUpdateSiblings);
					++this.iCurrentControlIndex;

				}

				dNewValue = oPrevControlWidget.getValue().get();

			}
			else if(oNextControlWidget && oNextControlWidget.getValue().get() < dNewValue) {

				if(bUpdateSiblings && this.getChildren()[this.getCurrentControlIndex() + 1].isEnabled()) {

					oChild = this.getChildren()[this.getCurrentControlIndex()];

					oChild.setValue(oChild.createValue(parseFloat(dNewValue)), true);

					++this.iCurrentControlIndex;
					this.setValue(oChild.createValue(parseFloat(dNewValue)), bUpdateSiblings);
					--this.iCurrentControlIndex;

				}

				dNewValue = oNextControlWidget.getValue().get();

			}

			oChild = this.getChildren()[this.getCurrentControlIndex()];

			oChild.setValue(oChild.createValue(parseFloat(dNewValue)), true);

			this.syncControlElement();

		},

		syncControlElement : function() {

			var dPosition = this.calculatePositionByValue(this.getChildren()[this.getCurrentControlIndex()].getValue());

			if(dPosition == this.getCurrentControl().dPosition) {
				return;
			}

			this.getCurrentControl().dPosition = dPosition;

			this.updateControlElement();
			this.updateRanges();
			this.updateBounds();

		},

		updateControlElement : function() {

			var oCurrentControl = this.getCurrentControl();

			oCurrentControl.oElement.style.left = Math.round(oCurrentControl.dPosition) + '%';
			oCurrentControl.oValueElement.style.left = Math.round(oCurrentControl.dPosition) + '%';
			oCurrentControl.oValueElement.innerHTML = this.getChildren()[this.getCurrentControlIndex()].getValue().get().formatNumber();

		},

		updateRanges : function() {

			var
				iCurrentControlIndex = this.getCurrentControlIndex(),
				oCurrentControl = this.getCurrentControl()
				;

			this.moveRangeElement(
				oCurrentControl.oLeftRangeElement,
				iCurrentControlIndex > 0? this.aControls[iCurrentControlIndex - 1].dPosition : 0,
				oCurrentControl.dPosition
				);

			this.moveRangeElement(
				oCurrentControl.oRightRangeElement,
				oCurrentControl.dPosition,
				iCurrentControlIndex < this.aControls.length - 1? this.aControls[iCurrentControlIndex + 1].dPosition : 100
				);

		},

		moveRangeElement : function(
			oElement,
			dPositionFrom,
			dPositionTo
			) {

			Common.Dom.setStyle(
				oElement,
				'left: ' + Math.round(dPositionFrom) + '%;' +
				'width: ' + (Math.round(dPositionTo) - Math.round(dPositionFrom)) + '%'
				);

		},

		updateBounds : function() {

			var
				aValues = [],
				aChildren = this.getChildren(),
				fCompareFunction = function(oMark, dValue) {

					return oMark.dValue == dValue;

				}
				;

			for(var i = 0, dValue; i < aChildren.length; i++) {

				dValue = parseFloat(aChildren[i].getValue().get());

				aValues.push(dValue);

				if(this.aControls[i].bSelected) {
					if(!this.aMarks.contains(dValue, fCompareFunction)) {

						Common.Class.remove(
							this.aControls[i].oValueElement,
							this.__self.CLASS_NAME_VALUE_ELEMENT_SELECTED
							);

						this.aControls[i].bSelected = false;

					}

				}
				else if(this.aMarks.contains(dValue, fCompareFunction)) {

					Common.Class.add(
						this.aControls[i].oValueElement,
						this.__self.CLASS_NAME_VALUE_ELEMENT_SELECTED
						);

					this.aControls[i].bSelected = true;

				}

			}

			for(var i = 0; i < this.aMarks.length; i++) {

				if(this.aMarks[i].bSelected) {
					if(!aValues.contains(this.aMarks[i].dValue)) {

						Common.Class.remove(
							this.aMarks[i].oElement,
							this.__self.CLASS_NAME_MARK_ELEMENT_SELECTED
							);

						this.aMarks[i].bSelected = false;

					}
				}
				else if(aValues.contains(this.aMarks[i].dValue)) {

					Common.Class.add(
						this.aMarks[i].oElement,
						this.__self.CLASS_NAME_MARK_ELEMENT_SELECTED
						);

					this.aMarks[i].bSelected = true;

				}

			}

		},

		next : function() {

			if(!this.isEnabled() || !this.getChildren()[this.getCurrentControlIndex()].isEnabled()) {
				return false;
			}

			var oCurrentValue = this.getChildren()[this.getCurrentControlIndex()].getValue();

			this.setValue(new ZForms.Value.Number(parseFloat(oCurrentValue.get()) + parseFloat(this.findNextStepByValue(oCurrentValue))));

		},

		prev : function() {

			if(!this.isEnabled() || !this.getChildren()[this.getCurrentControlIndex()].isEnabled()) {
				return false;
			}

			var oCurrentValue = this.getChildren()[this.getCurrentControlIndex()].getValue();

			this.setValue(new ZForms.Value.Number(parseFloat(oCurrentValue.get()) - parseFloat(this.findPrevStepByValue(oCurrentValue))));

		},

		updateContainerOffset : function() {

			this.oContainerOffset = Common.Dom.getAbsoluteCoords(this.oContainer);

		},

		calculateOffset : function(oEvent) {

			return Common.Event.getAbsoluteCoords(oEvent).iLeft - this.oContainerOffset.iLeft;

		},

		calculatePositionByValue : function(oValue) {

			var
				iSlideRuleIndex = this.findSlideRuleIndexByValue(oValue),
				oSlideRuleFrom = this.getSlideRuleByIndex(iSlideRuleIndex),
				oSlideRuleTo = this.getSlideRuleByIndex(iSlideRuleIndex + 1)
				;

			return (oValue.get() - oSlideRuleFrom.dValue) / (oSlideRuleTo.dValue - oSlideRuleFrom.dValue) * (oSlideRuleTo.dPercent - oSlideRuleFrom.dPercent) + oSlideRuleFrom.dPercent;

		},

		calculateValueByOffset : function(iOffset) {

			var dPercent = this.calculatePercentByOffset(iOffset);

			if(dPercent > 100) {
				dPercent = 100;
			}
			else if(dPercent < 0) {
				dPercent = 0;
			}

			var
				iSlideRuleIndex = this.findSlideRuleIndexByPercent(dPercent),
				oSlideRuleFrom = this.getSlideRuleByIndex(iSlideRuleIndex),
				oSlideRuleTo = this.getSlideRuleByIndex(iSlideRuleIndex + 1)
				;

			return new ZForms.Value.Number(
				(dPercent - this.aSlideRules[iSlideRuleIndex].dPercent) /
				(oSlideRuleTo.dPercent - oSlideRuleFrom.dPercent) *
				(oSlideRuleTo.dValue - oSlideRuleFrom.dValue) +
				oSlideRuleFrom.dValue
				);

		},

		calculatePercentByOffset : function(iOffset) {

			return iOffset / this.oContainer.offsetWidth * 100;

		},

		findSlideRuleIndexByPercent : function(dPercent) {

			if(dPercent == 0) {
				return 0;
			}

			for(var i = 0; i < this.aSlideRules.length; i++) {
				if(this.aSlideRules[i].dPercent >= dPercent) {
					return i - 1;
				}
			}

			return this.aSlideRules.length - 2;

		},

		findSlideRuleIndexByValue : function(oValue) {

			if(oValue.get() == this.getMin()) {
				return 0;
			}

			for(var i = 1; i < this.aSlideRules.length; i++) {
				if(this.aSlideRules[i].dValue >= oValue.get()) {
					return i - 1;
				}
			}

			return this.aSlideRules.length - 2;

		},

		findNextStepByValue : function(oValue) {

			if(oValue.get() == this.getMin()) {
				return this.aSlideRules[0].dStep;
			}

			for(var i = 0; i < this.aSlideRules.length; i++) {

				if(this.aSlideRules[i].dValue == oValue.get()) {
					return this.aSlideRules[i].dStep;
				}
				else if(this.aSlideRules[i].dValue > oValue.get()) {
					return this.aSlideRules[i - 1].dStep;
				}

			}

			return this.aSlideRules[this.aSlideRules.length - 1].dStep;

		},

		findPrevStepByValue : function(oValue) {

			if(oValue.get() == this.getMin()) {
				return this.aSlideRules[0].dStep;
			}

			for(var i = 0; i < this.aSlideRules.length; i++) {
				if(this.aSlideRules[i].dValue >= oValue.get()) {
					return this.aSlideRules[i - 1].dStep;
				}
			}

			return this.aSlideRules[this.aSlideRules.length - 1].dStep;

		},

		getSlideRuleByIndex : function(iIndex) {

			return this.aSlideRules[iIndex];

		},

		disableControlByIndex : function(iIndex) {

			Common.Class.add(
				this.aControls[iIndex].oElement,
				this.__self.CLASS_NAME_CONTROL_ELEMENT_DISABLED
				);

			Common.Class.add(
				this.aControls[iIndex].oValueElement,
				this.__self.CLASS_NAME_VALUE_ELEMENT_DISABLED
				);

		},

		enableControlByIndex : function(iIndex) {

			Common.Class.remove(
				this.aControls[iIndex].oElement,
				this.__self.CLASS_NAME_CONTROL_ELEMENT_DISABLED
				);

			Common.Class.remove(
				this.aControls[iIndex].oValueElement,
				this.__self.CLASS_NAME_VALUE_ELEMENT_DISABLED
				);

		},

		destruct : function() {

			this.oContainer = null;
			this.oScaleElement = null;

			if(!this.isTemplate()) {

				for(i = 0; i < this.aMarks.length; i++) {
					this.aMarks[i].oElement = null;
				}

				for(i = 0; i < this.aControls.length; i++) {

					this.aControls[i].oElement = null;
					this.aControls[i].oValueElement = null;
					this.aControls[i].oLeftRangeElement = null;
					this.aControls[i].oRightRangeElement = null;

				}

			}

			this.__base();

		}

	},
	// static
	{

		CLASS_NAME_SLIDER                   : 'zf-slider-horizontal',
		CLASS_NAME_SLIDER_SCALE             : 'zf-slider-scale',
		CLASS_NAME_CONTROL_ELEMENT          : 'zf-slider-control',
		CLASS_NAME_CONTROL_ELEMENT_SELECTED : 'zf-slider-control-selected',
		CLASS_NAME_CONTROL_ELEMENT_DISABLED : 'zf-slider-control-disabled',
		CLASS_NAME_VALUE_ELEMENT            : 'zf-slider-value',
		CLASS_NAME_VALUE_ELEMENT_SELECTED   : 'zf-slider-value-selected',
		CLASS_NAME_VALUE_ELEMENT_DISABLED   : 'zf-slider-value-disabled',
		CLASS_NAME_MARK_ELEMENT             : 'zf-slider-mark',
		CLASS_NAME_MARK_ELEMENT_SELECTED    : 'zf-slider-mark-selected',
		CLASS_NAME_RANGE_ELEMENT            : 'zf-slider-range',

		aAll : [],
		iActiveIndex : 0,

		add : function(oSliderInput) {

			if(!(oSliderInput instanceof this)) {
				return;
			}

			this.aAll.push(oSliderInput);

			return this.aAll.length - 1;

		},

		setActiveIndex : function(iIndex) {

			this.iActiveIndex = iIndex;

		}

	}
	);
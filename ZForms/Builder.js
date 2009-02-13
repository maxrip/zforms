ZForms.Builder = Abstract.inheritTo(
	{

		__constructor : function(aForm) {

			this.bFakedSafari = Common.Browser.isSafari() && !navigator.appVersion.match(/Version\/3/);
			this.aLabels = this.fillLabels();
			this.aElementsByName = [];
			this.aTemplates = [];
			this.oForm = null;

			this.build(aForm);
			this.fillElements();
			this.addDependencies(aForm);

		},

		fillLabels : function() {

			var aResult = [];

			 if(!this.bFakedSafari) {
			 	return aResult;
			 }

			 var aLabelElements = document.getElementsByTagName('label');

			 for(var i = 0; i < aLabelElements.length; i++) {
			 	if(aLabelElements[i].htmlFor) {
			 		aResult[aLabelElements[i].htmlFor] = aLabelElements[i];
			 	}
			 }

			 return aResult;

		},

		getForm : function() {

			return this.oForm;

		},

		build : function(aForm) {

			for(var i = 0, iLength = aForm.length; i < iLength; i++) {
				this.createWidgetByObject(aForm[i].sID, aForm[i]);
			}

		},

		createWidgetByObject : function(sId, oObject) {

			if(oObject.oMove) {
				this.moveObject(oObject);
			}

			if(oObject.oRepeat) {
				this.makeMultiplicator(oObject);
			}

			if(oObject.sType != 'form') {
				if(!(oObject.oRepeat && oObject.oRepeat.bTemplate)) {
					if(!this.getElementById(this.getParentId(oObject))) {
						alert(oObject.sID);
					}
				}
			}

			var bTemplate = oObject.sType == 'form'?
				false :
				(
					(oObject.oRepeat && oObject.oRepeat.bTemplate) ||
					this.getElementById(this.getParentId(oObject)).isTemplate()
				)
				;


			switch(oObject.sType) {

				case 'form':
					return this.makeForm(oObject);
				break;

				case 'fieldset':
				case 'sheet':

					if(oObject.oSheet) {
						return this.makeSheet(oObject, bTemplate);
					}
					else if(oObject.oSlider) {
						return this.makeSliderInput(oObject, bTemplate);
					}
					else {
						return this.makeFieldContainer(oObject, bTemplate);
					}

				break;

				case 'number':
				case 'integer':
				case 'decimal':
					return this.makeNumberInput(oObject, bTemplate);
				break;

				case 'date':
				case 'datetime':
				case 'datemonth':
					return this.makeDateInput(oObject, bTemplate);
				break;

				case 'select':
					return this.makeSelectInput(oObject, bTemplate);
				break;

				case 'checkbox':
					return this.makeCheckBoxGroup(oObject, bTemplate);
				break;

				case 'radio':
					return this.makeRadioButtonGroup(oObject, bTemplate);
				break;

				case 'combobox':
					return this.makeComboInput(oObject, bTemplate);
				break;

				case 'button':
					return this.makeButton(oObject, bTemplate);
				break;

				case 'submit':
					return this.makeSubmitButton(oObject, bTemplate);
				break;

				default:
					return this.makeTextInput(oObject, bTemplate);
				break;

			}

		},

		makeMultiplicator : function(oObject) {

			var oMultiplicator = this.getElementById(oObject.oRepeat.sID + ZForms.Widget.Container.Multiplicator.POSTFIX_ID);

			if(oMultiplicator) {
				return oMultiplicator;
			}

			var oMultiplicatorElement = document.createElement('div');
			oMultiplicatorElement.id = oObject.oRepeat.sID + ZForms.Widget.Container.Multiplicator.POSTFIX_ID;

			return this.getElementById(oObject.sParent_ID).addChild(
				ZForms.createMultiplicator(
					oMultiplicatorElement,
					null,
					{
						sButtonAddId    : oObject.oRepeat.sAppend_ID,
						sButtonRemoveId : oObject.oRepeat.sRemove_ID,
						sButtonUpId     : oObject.oRepeat.sUp_ID,
						sButtonDownId   : oObject.oRepeat.sDown_ID,
						iMin            : oObject.oRepeat.iMin || 1,
						iMax            : oObject.oRepeat.iMax || 10
					}
					)
				);

		},

		makeForm : function(oObject) {

			this.oForm = ZForms.createForm(
				this.$(oObject.sID),
				this.getRow(oObject),
				{
					bUpdatableSubmit : oObject.oSubmit? oObject.oSubmit.bDisabled_button : true,
					bCheckForValid   : oObject.oSubmit? oObject.oSubmit.bValid : true,
					bCheckForChanged : oObject.oSubmit? oObject.oSubmit.bChanged : false,
					bPreventSubmit   : oObject.oSubmit? oObject.oSubmit.bPreventSubmit : false
				}
				);

		},

		makeFieldContainer : function(oObject, bTemplate) {

			return this.addChild(
				ZForms.createContainer(
					this.$(oObject.sID),
					this.getRow(oObject),
					{
						bTemplate : bTemplate
					}
					),
				oObject
				);

		},

		makeSheetContainer : function(oObject) {

			var oElement;

			try {
				oElement = this.$(oObject.oSheet.sParent_ID);
			}
			catch(oException) {
				oElement = Common.Dom.createElement('div', { id : oObject.oSheet.sParent_ID });
			}

			this.addChild(
				ZForms.createSheetContainer(oElement),
				oObject
				);

		},

		makeSheet : function(oObject, bTemplate) {

			if(!this.getElementById(oObject.oSheet.sParent_ID)) {
				this.makeSheetContainer(oObject);
			}

			if(oObject.oSheet.sLegend_ID &&
				oObject.oSheet.sParent_ID) {
				this.makeTab(
					oObject.oSheet.sLegend_ID,
					oObject.oSheet.sParent_ID
					);
			}

			var oSheet = ZForms.createSheet(
				this.$(oObject.sID),
				this.getRow(oObject),
				{
					bTemplate : bTemplate
				}
				);

			if(oObject.oSheet.sLegend_ID) {
				oSheet.addLegendButton(ZForms.createButton(this.$(oObject.oSheet.sLegend_ID)));
			}

			if(oObject.oSheet.sPrev_ID) {
				oSheet.addPrevButton(ZForms.createButton(this.$(oObject.oSheet.sPrev_ID)));
			}

			if(oObject.oSheet.sNext_ID) {
				oSheet.addNextButton(ZForms.createButton(this.$(oObject.oSheet.sNext_ID)));
			}

			return this.addChild(
				oSheet,
				oObject
				);

		},

		makeTextInput : function(oObject, bTemplate) {

			return this.addChild(
				ZForms.createTextInput(
					this.$(oObject.sID),
					this.getRow(oObject),
					{
						sPlaceHolder : oObject.sPlaceHolder || '',
						bTemplate : bTemplate
					}
					),
				oObject
				);
		},

		makeNumberInput : function(oObject, bTemplate) {

			return this.addChild(
				ZForms.createNumberInput(
					this.$(oObject.sID),
					this.getRow(oObject),
					{
						bTemplate    : bTemplate,
						sPlaceHolder : oObject.sPlaceHolder || '',
						bFloat       : oObject.sType == 'decimal',
						bNegative    : oObject.bNegative
					}
					),
				oObject
				);

		},

		makeSliderInput : function(oObject, bTemplate) {

			return this.addChild(
				ZForms['createSlider' + (oObject.oSlider.sType == 'vertical'? 'Vertical' : '')](
					this.$(oObject.sID),
					this.getRow(oObject),
					{
						bTemplate   : bTemplate,
						aSlideRules : oObject.oSlider.aRules
					}
					),
				oObject
				);

		},

		makeDateInput : function(oObject, bTemplate) {

			return this.addChild(
				ZForms.createDateInput(
					this.$(oObject.sID),
					this.getRow(oObject),
					{
						bTemplate            : bTemplate,
						bOnlyMonths          : oObject.sType == 'datemonth',
						bWithTime            : oObject.sType == 'datetime',
						oPlaceHolders        : oObject.oPlaceHolders,
						oPickerOpenerElement : oObject.sPicker_ID? this.$(oObject.sPicker_ID) : null
					}
					),
				oObject
				);

		},

		makeSelectInput : function(oObject, bTemplate) {

			return this.addChild(
				ZForms.createSelectInput(
					this.$(oObject.sID),
					this.getRow(oObject),
					{
						bTemplate : bTemplate
					}
					),
				oObject
				);

		},

		makeComboInput : function(oObject, bTemplate) {

			return this.addChild(
				ZForms.createComboInput(
					this.$(oObject.sID),
					this.getRow(oObject),
					{
						bTemplate           : bTemplate,
						sPlaceHolder        : oObject.sPlaceHolder || '',
						oOptionsElement     : this.$(oObject.sFrom_ID),
						oShowOptionsElement : oObject.sShowOptions_ID? this.$(oObject.sShowOptions_ID) : null
					}
					),
				oObject
				);

		},

		makeInputGroup : function(oObject, bTemplate, fCreateFunction) {

			var aStateInputs = [];

			for(var i = 0; i < oObject.asOption_ID.length; i++) {
				aStateInputs.push([this.$(oObject.asOption_ID[i][0]), this.$(oObject.asOption_ID[i][1])]);
			}

			var oResult = ZForms[fCreateFunction](
				this.$(oObject.sID),
				this.getRow(oObject),
				{
					bTemplate : bTemplate
				},
				aStateInputs
				);

			for(var i = 0; i < oResult.aChildren.length; i++) {
				this.makeEnablableLabel(oResult.aChildren[i]);
			}

			return this.addChild(
				oResult,
				oObject
				);

		},

		makeCheckBoxGroup : function(oObject, bTemplate) {

			return this.makeInputGroup(oObject, bTemplate, 'createCheckBoxGroup');

		},

		makeRadioButtonGroup : function(oObject, bTemplate) {

			return this.makeInputGroup(oObject, bTemplate, 'createRadioButtonGroup');

		},

		makeEnablableLabel : function(oInput) {

			if(!this.bFakedSafari) {
				return;
			}

			var
				oLabel = this.aLabels[oInput.oElement.id],
				bChecked = oInput.isChecked();
				;

			if(!oLabel) {
				return;
			}

			Common.Event.add(
				oLabel,
				ZForms.Widget.DOM_EVENT_TYPE_MOUSEDOWN,
				function() {

					bChecked = oInput.isChecked();

				}
				);

			Common.Event.add(
				oLabel,
				ZForms.Widget.DOM_EVENT_TYPE_MOUSEUP,
				function() {

					if(!oInput.isEnabled()) {
						return;
					}

					if(bChecked == oInput.isChecked()) {

						oInput.check();
						oInput.processEvents(true);

					}

				}
				);

		},

		makeButton : function(oObject, bTemplate) {

			return this.addChild(
				ZForms.createButton(
					this.$(oObject.sID),
					this.getRow(oObject),
					{
						bTemplate : bTemplate
					}
					),
				oObject
				);

		},

		makeSubmitButton : function(oObject, bTemplate) {

			return this.addChild(
				ZForms.createSubmitButton(
					this.$(oObject.sID),
					this.getRow(oObject),
					{
						bDisableOnSubmit : oObject.bDisableOnSubmit,
						bTemplate        : bTemplate
					}
					),
				oObject
				);

		},

		makeTab : function(
			sLegendId,
			sTabsContainerId
			) {

			var
				oTabNode = this.$(sLegendId),
				oTabsContainerNode
				;

			try {
				oTabsContainerNode = this.$(sTabsContainerId + '_tabs');
			}
			catch(oException) {

				var	oParentNode = this.$(sTabsContainerId);

				oTabsContainerNode = oParentNode.insertBefore(document.createElement('div'), oParentNode.firstChild);

				oTabsContainerNode.id = sTabsContainerId + '_tabs';
				Common.Class.add(oTabsContainerNode, 'tabs');

			}

			oTabsContainerNode.appendChild(oTabNode.parentNode.removeChild(oTabNode));

		},

		addChild : function(
			oChild,
			oObject
			) {

			var oParent = this.getElementById(this.getParentId(oObject));

			if(oObject.oRepeat &&
				oObject.oRepeat.bTemplate &&
				oParent instanceof ZForms.Widget.Container.Multiplicator
				) {

				this.addTemplate(oChild);

				return oParent.addTemplate(oChild);

			}
			else if(oChild.isTemplate()) {
				this.addTemplate(oChild);
			}

			return oParent.addChild(oChild);

		},

		addTemplate : function(oTemplate) {

			this.aTemplates[oTemplate.getId()] = oTemplate;

		},

		$ : function(sId) {

			var oResult = document.getElementById(sId);

			if(!oResult) {
				throw('Element with id "' + sId + '" no exists');
			}

			return oResult;

		},

		getRow : function(oObject) {

			if(oObject.sRow_ID) {
				return this.$(oObject.sRow_ID);
			}

			return this.$(oObject.sID);

		},

		getParentId : function(oObject) {

			if(oObject.oRepeat) {
				return oObject.oRepeat.sID + ZForms.Widget.Container.Multiplicator.POSTFIX_ID;
			}

			if(oObject.oSheet &&
				this.getElementById(oObject.oSheet.sParent_ID)) {
				return oObject.oSheet.sParent_ID;
			}

			return oObject.sParent_ID;

		},

		moveObject : function(oObject) {

			if(oObject.oMove.sBefore_ID) {

				var oInsertBeforeElement = this.$(oObject.oMove.sBefore_ID);

				if(oInsertBeforeElement) {

					var oMovedElement = this.$(oObject.sRow_ID || oObject.sID);

					oInsertBeforeElement.parentNode.insertBefore(
						oMovedElement.parentNode.removeChild(oMovedElement),
						oInsertBeforeElement
						);

				}

			}

		},

		fillElements : function(oElement) {

			var oElement = oElement || this.oForm;

			if(oElement.getName()) {
				this.aElementsByName[oElement.getName()] = oElement;
			}

			if(oElement instanceof ZForms.Widget.Container.Group) {
				this.aElementsByName[oElement.getName()] = oElement;
			}
			else if(oElement instanceof ZForms.Widget.Container) {

				for(var i = 0; i < oElement.aChildren.length; i++) {
					this.fillElements(oElement.aChildren[i]);
				}

				if(oElement.oTemplate) {
					this.fillElements(oElement.oTemplate);
				}

			}

		},

		getElementById : function(sId) {

			var oElement = this.oForm.getWidgetById(sId) ||
				this.getTemplateById(sId)
				;

			return oElement;

		},

		getElementByName : function(sName) {

			return this.aElementsByName[sName];

		},

		getTemplateById : function(sId) {

			return this.aTemplates[sId];

		},

		addDependencies : function(aForm) {

			for(var i = 0, iLength = aForm.length; i < iLength; i++) {

				if(aForm[i].oValid) {
					this.makeValidDependence(aForm[i].sID, aForm[i].oValid);
				}

				if(aForm[i].sType == 'email') {
					this.makeEmailDependence(aForm[i].sID);
				}

				if(aForm[i].oRequired) {
					this.makeRequiredDependence(aForm[i].sID, aForm[i].oRequired);
				}

				if(aForm[i].oDepended) {
					this.makeEnableDependence(aForm[i].sID, aForm[i].oDepended);
				}

				if(aForm[i].oOptions_depended) {
					this.makeOptionsDependence(ZForms.Dependence.TYPE_OPTIONS, aForm[i].sID, aForm[i].oOptions_depended);
				}

				if(aForm[i].oOptions_checked) {
					this.makeOptionsDependence(ZForms.Dependence.TYPE_CHECK, aForm[i].sID, aForm[i].oOptions_checked);
				}

				if(aForm[i].oClass) {
					this.makeClassDependence(aForm[i].sID, aForm[i].oClass);
				}

			}

		},

		makeRequiredDependence : function(sId, oRequired) {

			var
				oElement = this.getElementById(sId),
				iLogic = this.getLogic(oRequired)
				;

			oElement.addDependence(
				ZForms.createRequiredDependence(
					oElement,
					{
						iLogic : iLogic,
						iMin   : oRequired.iMin
					}
					)
				);

			if(!oRequired.aFrom) {
				return;
			}

			for(var i = 0, oWidgetFrom, oFrom; i < oRequired.aFrom.length; i++) {

				oFrom = oRequired.aFrom[i];
				oWidgetFrom = this.getElementByName(oFrom.sName);

				if(!oWidgetFrom) {
					this.throwDependenceException(oFrom.sName, oElement.getName() || oElement.getId());
				}

				if(oFrom.mData && oFrom.mData instanceof Function) {
					oElement.addDependence(
						ZForms.createFunctionDependence(
							oWidgetFrom,
							{
								iType     : ZForms.Dependence.TYPE_REQUIRE,
								fFunction : oFrom.mData,
								iLogic    : iLogic,
								bInverse  : oFrom.bInverse
							}
							)
						);
				}
				else {
					oElement.addDependence(
						new ZForms.Dependence.Required(
							oWidgetFrom,
							{
								iLogic : iLogic,
								iMin   : oRequired.iMin? oRequired.iMin : 1
							}
							)
						);
				}

			}

		},

		makeValidDependence : function(sId, oValid) {

			var
				oElement = this.getElementById(sId),
				iLogic = this.getLogic(oValid)
				;

			for(var i = 0, oWidgetFrom, oFrom; i < oValid.aFrom.length; i++) {

				oFrom = oValid.aFrom[i];
				oWidgetFrom = oFrom.sName? this.getElementByName(oFrom.sName) : oElement;

				if(!oWidgetFrom) {
					this.throwDependenceException(oFrom.sName, oElement.getName() || oElement.getId());
				}

				if(oFrom.mData instanceof Function) {
					oElement.addDependence(
						ZForms.createFunctionDependence(
							oWidgetFrom,
							{
								iType     : ZForms.Dependence.TYPE_VALID,
								fFunction : oFrom.mData,
								iLogic    : iLogic,
								bInverse  : oFrom.bInverse
							}
							)
						);
				}
				else if(oFrom.oCompare) {
					oElement.addDependence(
						ZForms.createValidCompareDependence(
							oWidgetFrom,
							{
								sCondition : oFrom.oCompare.sCondition,
								mArgument  : oFrom.oCompare.sName?
									this.getElementByName(oFrom.oCompare.sName) :
									oFrom.oCompare.sValue,
								iLogic     : iLogic,
								bInverse   : oFrom.bInverse
							}
							)
						);
				}
				else {
					oElement.addDependence(
						ZForms.createValidDependence(
							oWidgetFrom,
							{
								rPattern   : typeof oFrom.mData == 'undefined'?
									/.+/ :
									(oFrom.mData instanceof RegExp?
										oFrom.mData :
										new RegExp('^' + oFrom.mData + '$')
										),
								iLogic     : iLogic,
								bInverse   : oFrom.bInverse,
								sClassName : oFrom.sClassName
							}
							)
						);
				}

			}

		},

		makeEmailDependence : function(sId) {

			var oElement = this.getElementById(sId);

			oElement.addDependence(
				ZForms.createValidEmailDependence(
					oElement
					)
				);

		},

		makeEnableDependence : function(sId, oDepended) {

			var
				oElement = this.getElementById(sId),
				iLogic = this.getLogic(oDepended)
				;

			for(var i = 0, oWidgetFrom, oFrom; i < oDepended.aFrom.length; i++) {

				oFrom = oDepended.aFrom[i];
				oWidgetFrom = this.getElementByName(oFrom.sName);

				if(!oWidgetFrom) {
					this.throwDependenceException(oFrom.sName, oElement.getName() || oElement.getId());
				}

				if(oFrom.mData instanceof Function) {
					oElement.addDependence(
						ZForms.createFunctionDependence(
							oWidgetFrom,
							{
								iType     : ZForms.Dependence.TYPE_ENABLE,
								fFunction : oFrom.mData,
								iLogic    : iLogic,
								bInverse  : oFrom.bInverse
							}
							)
						);
				}
				else if(oFrom.oCompare) {
					oElement.addDependence(
						ZForms.createEnableCompareDependence(
							oWidgetFrom,
							{
								sCondition : oFrom.oCompare.sCondition,
								mArgument  : oFrom.oCompare.sName?
									this.getElementByName(oFrom.oCompare.sName) :
									oFrom.oCompare.sValue,
								iLogic     : iLogic,
								bInverse   : oDepended.aFrom[i].bInverse
							}
							)
						);
				}
				else {
					oElement.addDependence(
						ZForms.createEnableDependence(
							oWidgetFrom,
							{
								rPattern : typeof oDepended.aFrom[i].mData == 'undefined'?
									/.+/ :
									(oDepended.aFrom[i].mData instanceof RegExp?
										oDepended.aFrom[i].mData :
										new RegExp('^' + oDepended.aFrom[i].mData + '$')
										),
								iLogic   : iLogic,
								bInverse : oDepended.aFrom[i].bInverse
							}
							)
						);
				}

			}

		},

		makeOptionsDependence : function(iType, sId, oDepended) {

			var
				oElement = this.getElementById(sId),
				iLogic = this.getLogic(oDepended)
				;

			for(var i = 0, oWidgetFrom, oFrom, aPatterns; i < oDepended.aFrom.length; i++) {

				oFrom = oDepended.aFrom[i];
				oWidgetFrom = this.getElementByName(oFrom.sName);

				if(!oWidgetFrom) {
					this.throwDependenceException(oFrom.sName, oElement.getName() || oElement.getId());
				}

				if(oFrom.mData instanceof Function) {
					oElement.addDependence(
						ZForms.createFunctionDependence(
							oWidgetFrom,
							{
								iType     : ZForms.Dependence.TYPE_OPTIONS,
								fFunction : oFrom.mData,
								iLogic    : iLogic,
								bInverse  : oFrom.bInverse
							}
							)
						);
				}
				else {

					aPatterns = [];

					for(var j = 0; j < oFrom.mData.length; j++) {
						aPatterns.push(
							{
								rSource      : oFrom.mData[j][0] instanceof RegExp?
									oFrom.mData[j][0] :
									new RegExp('^' + oFrom.mData[j][0] + '$'),
								rDestination : oFrom.mData[j][1] instanceof RegExp?
									oFrom.mData[j][1] :
									new RegExp('^' + oFrom.mData[j][1] + '$')
							}
							);
					}

					oElement.addDependence(
						ZForms.createOptionsDependence(
							oWidgetFrom,
							{
								aPatterns : aPatterns,
								iLogic    : iLogic
							}
							)
						);

				}

			}

		},

		makeClassDependence : function(sId, oClass) {

			var
				oElement = this.getElementById(sId),
				iLogic = this.getLogic(oClass)
				;

			for(var i = 0, oWidgetFrom, oFrom, aPatternToClasses; i < oClass.aFrom.length; i++) {

				oFrom = oClass.aFrom[i];
				oWidgetFrom = this.getElementByName(oFrom.sName);

				if(!oWidgetFrom) {
					this.throwDependenceException(oFrom.sName, oElement.getName() || oElement.getId());
				}

				if(oFrom.mData instanceof Function) {
					oElement.addDependence(
						ZForms.createFunctionDependence(
							oWidgetFrom,
							{
								iType     : ZForms.Dependence.TYPE_CLASS,
								fFunction : oFrom.mData,
								iLogic    : iLogic,
								bInverse  : oFrom.bInverse
							}
							)
						);
				}
				else {

					aPatternToClasses = [];

					for(var j = 0; j < oFrom.mData.length; j++) {
						aPatternToClasses.push(
							{
								rPattern   : oFrom.mData[j][0] instanceof RegExp?
									oFrom.mData[j][0] :
									new RegExp('^' + oFrom.mData[j][0] + '$'),
								sClassName : oFrom.mData[j][1]
							}
							);
					}

				}

				oElement.addDependence(
					ZForms.createClassDependence(
						oWidgetFrom,
						{
							aPatternToClasses : aPatternToClasses,
							iLogic            : iLogic
						}
						)
					);

			}

		},

		getLogic : function(oObject) {

			return oObject.sLogic == 'or'? ZForms.Dependence.LOGIC_OR : ZForms.Dependence.LOGIC_AND;

		},

		throwDependenceException : function(sNameFrom, sNameTo) {

			throw('Widget with name "' + sNameFrom + '" no exists (adding dependence to widget with name/id "' + sNameTo + '")');

		}

	}
	);
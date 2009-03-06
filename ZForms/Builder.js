ZForms.Builder = Abstract.inheritTo(
	{

		__constructor : function(oFormElement) {

			this.oFormElement = oFormElement;
			this.oForm = null;
			this.aWidgets = [];
			this.aSheetContainers = [];
			this.aRepeatContainers = [];
			//this.aRepeatRoots = [];
			this.oLastRepeatRoot = null;
			this.aDependencies = [];

			var oThis = this;
			Common.Event.add(
				window,
				ZForms.Widget[Common.Browser.isIE()? 'DOM_EVENT_TYPE_BEFOREUNLOAD' : 'DOM_EVENT_TYPE_UNLOAD'],
				function() {

					oThis.oFormElement = null;

				}
				);

		},

		$ : function(sId) {

			var oResult = document.getElementById(sId);

			if(!oResult) {
				ZForms.throwException('Element with id "' + sId + '" no exists');
			}

			return oResult;

		},

		build : function() {

			this.oForm = this.createWidgetByElement(this.oFormElement);

			var
				aElements = Common.Dom.getElementsByClassName(this.oFormElement, this.__self.CLASS_NAME_WIDGET),
				iLength = aElements.length,
				aWidgets = []
				i = 0
				;
			while(i < iLength) {
				aWidgets.push(this.createWidgetByElement(aElements[i++]));
			}

			var
				oWidget,
				i = 0
				;

			while(oWidget = aWidgets[i++]) {
				this.aWidgets[oWidget.getName()] = oWidget;
			}

			this.buildDependencies();

			if(this.oForm) {
				this.oForm.init();
			}

			this.oFormElement = null;
			this.aWidgets.length = 0;
			this.aSheetContainers.length = 0;
			this.aRepeatContainers.length = 0;
			this.oLastRepeatRoot = null;
			this.aDependencies.length = 0;

			return this.oForm;

		},

		createWidgetByElement : function(oElement) {

			var
				oParams = oElement.onclick instanceof Function? oElement.onclick() || {} : {},
				sType = oParams.sType || this.extractTypeFromElement(oElement),
				oParentWidget = this.getParentWidget(oParams, sType, oElement),
				oResult = ZForms[this.getCreateWidgetFunction(sType)](
					oElement,
					this.getClassElement(oParams.sCId, sType, oElement),
					this.processOptions(oParams.oOptions, oParentWidget)
					)
				;

			if(oParams.sRepeatGroup) {

				//this.aRepeatRoots[oResult.getId()] = oResult;
				this.oLastRepeatRoot = oResult;

			}

			if(oParams.oRequired || oParams.oValid || oParams.oEnabled || oParams.oDependedOptions || oParams.oDependedClasses) {
				this.aDependencies.push({ oWidget : oResult, oParams : oParams });
			}

			oElement.onclick = null;
			oElement.removeAttribute('onclick');

			if(oParentWidget) {

				if(oParams.sRepeatGroup && oResult.isTemplate()) {
					oParentWidget.addTemplate(oResult);
				}
				else if(sType == 'buttonprev' || sType == 'buttonnext') {
					oParentWidget['add' + (sType == 'buttonprev'? 'Prev' : 'Next') + 'Button'](oResult);
				}
				else if((sType == 'buttonadd' || sType == 'buttonremove' || sType == 'buttonup' || sType == 'buttondown') && !oParentWidget.isTemplate()) {

					var aMatches = sType.match(/button(\w)(.+)/);
					oParentWidget.getMultiplier()['add' + aMatches[1].toUpperCase() + aMatches[2] + 'Button'](oResult);

				}
				else {
					oParentWidget.addChild(oResult);
				}

			}

			return oResult;

		},

		processOptions : function(
			oOptions,
			oParentWidget
			) {

			if(!oOptions) {
				return;
			}

			if(oOptions.sPickerId) {

				oOptions.oPickerOpenerElement = this.$(oOptions.sPickerId);
				delete oOptions.sPickerId;

			}

			if(oOptions.sListId) {

				oOptions.oOptionsElement = this.$(oOptions.sListId);
				delete oOptions.sListId;

			}

			if(oOptions.sListShowId) {

				oOptions.oShowOptionsElement = this.$(oOptions.sListShowId);
				delete oOptions.sListShowId;

			}

			if(oParentWidget && oParentWidget.isTemplate()) {
				oOptions.bTemplate = true;
			}

			return oOptions;

		},

		getClassElement : function(
			sClassElementId,
			sType,
			oElement
			) {

			if(sClassElementId) {
				return this.$(sClassElementId);
			}

			if(
				sType == 'form' ||
				sType == 'fieldset' ||
				sType == 'sheet' ||
				sType == 'slider' ||
				sType == 'slidervertical' ||
				sType == 'checkboxgroup' ||
				sType == 'radiobuttongroup' ||
				sType == 'submit' ||
				sType == 'button' ||
			   	sType == 'buttonprev' ||
			   	sType == 'buttonnext' ||
				sType == 'buttonadd' ||
				sType == 'buttonremove' ||
				sType == 'buttonup' ||
				sType == 'buttondown') {
				return;
			}

			if(sType == 'state' || sType == 'hidden') {
				return oElement.parentNode;
			}

			return oElement.parentNode.parentNode;

		},

		getParentWidget : function(
			oParams,
			sType,
			oElement
			) {

			if(sType == 'sheet') {
				return this.getSheetContainer(oParams, oElement);
			}

			if(oParams.sRepeatGroup) {
				return this.getRepeatContainer(oParams, oElement);
			}

			if(sType == 'buttonprev' || sType == 'buttonnext') {
				return this.getSheet(oElement);
			}

			if(sType == 'buttonadd' || sType == 'buttonremove' || sType == 'buttonup' || sType == 'buttondown') {
				return this.getRepeatRoot(oElement);
			}

			if(sType == 'form') {
				return;
			}

			if(oParams.sPId) {
				return this.oForm.getWidgetById(oParams.sPId);
			}

			while(oElement = oElement.parentNode) {
				if(oElement.tagName.toLowerCase() == 'form' ||
					Common.Class.match(oElement, this.__self.CLASS_NAME_WIDGET)
					) {
					return this.oForm.getWidgetById(this.__self.getId(oElement));
				}
			}

		},

		getRepeatContainer : function(
			oParams,
			oElement
			) {

			if(!this.aRepeatContainers[oParams.sRepeatGroup]) {
				this.aRepeatContainers[oParams.sRepeatGroup] = this
					.getParentWidget({}, null, oElement)
					.addChild(ZForms.createMultiplicator(null, null, oParams.oRepeatOptions))
					;
			}

			return this.aRepeatContainers[oParams.sRepeatGroup];

		},

		getRepeatRoot : function() {

			return this.oLastRepeatRoot;

			/*while(oElement = oElement.parentNode) {

				if(oElement.tagName.toLowerCase() == 'form') {
					ZForms.throwException('repeat root not found');
				}

				if(Common.Class.match(oElement, this.__self.CLASS_NAME_WIDGET)) {

					var oResult = this.aRepeatRoots[this.__self.getId(oElement)];
					if(oResult) {
						return oResult;
					}

				}
			}*/

		},

		getSheetContainer : function(
			oParams,
			oElement
			) {

			var sSheetGroup = oParams.sSheetGroup || this.__self.getId(oElement.parentNode);

			if(!this.aSheetContainers[sSheetGroup]) {

				oParams.sType = null;

				this.aSheetContainers[sSheetGroup] = this
					.getParentWidget(oParams, null, oElement)
					.addChild(ZForms.createSheetContainer())
					;

			}

			return this.aSheetContainers[sSheetGroup];

		},

		getSheet : function(oElement) {

			while(oElement = oElement.parentNode) {
				if(oElement.tagName.toLowerCase() == 'form' ||
					Common.Class.match(oElement, this.__self.CLASS_NAME_WIDGET)
					) {

					var oParentWidget = this.oForm.getWidgetById(this.__self.getId(oElement));
					if(oParentWidget instanceof ZForms.Widget.Container.Sheet) {
						return oParentWidget;
					}

				}
			}

		},

		extractTypeFromElement : function(oElement) {

			var
				sTagName = oElement.tagName.toLowerCase(),
				sInputType
				;

			if(sTagName == 'input') {

				sInputType = oElement.type.toLowerCase();

				if(sInputType == 'radio' || sInputType == 'checkbox') {
					return 'state';
				}

			}

			var aMatches = oElement.className.match(this.__self.rTypePattern);

			if(aMatches) {
				return aMatches[1];
			}

			switch(sTagName) {

				case 'input':

					if(sInputType == 'search') {
						return 'text';
					}

					return sInputType;

				break;

				case 'form':
				case 'fieldset':
				case 'select':
					return sTagName;
				break;

				case 'textarea':
					return 'text';
				break;

			}

			ZForms.throwException('can\'t extract widget type from element with id "' +
				this.__self.getId(oElement) +
				'"'
				);

		},

		getCreateWidgetFunction : function(sType) {

			if(!this.__self.aTypesToCreateWidgetFunction[sType]) {
				ZForms.throwException('Unsupported widget type "' + sType + '"');
			}

			return 'create' + this.__self.aTypesToCreateWidgetFunction[sType];

		},

		getWidgetByName : function(sName) {

			return this.aWidgets[sName];

		},

		buildDependencies : function() {

			var
				aDependencies = this.aDependencies,
				iLength = this.aDependencies.length,
				i = 0,
				oDependence,
				oParams
				;

			while(i < iLength) {

				oDependence = aDependencies[i++];
				oParams = oDependence.oParams;

				if(oParams.oRequired) {
					this.buildRequiredDependence(oDependence.oWidget, oParams.oRequired);
				}

				if(oParams.oValid) {
					this.buildValidOrEnabledDependence(oDependence.oWidget, oParams.oValid, ZForms.Dependence.TYPE_VALID);
				}

				if(oParams.oEnabled) {
					this.buildValidOrEnabledDependence(oDependence.oWidget, oParams.oEnabled, ZForms.Dependence.TYPE_ENABLE);
				}

				if(oParams.oDependedOptions) {
					this.buildOptionsDependence(oDependence.oWidget, oParams.oDependedOptions);
				}

				if(oParams.oDependedClasses) {
					this.buildClassesDependence(oDependence.oWidget, oParams.oDependedClasses);
				}

			}

		},

		buildRequiredDependence : function(oWidget, oRequired) {

			var iLogic = this.getLogic(oRequired);

			oRequired.aFrom = this.__self.prependToArray({ iMin : oRequired.iMin }, oRequired.aFrom);

			var
				i = 0,
				oFrom,
				oWidgetFrom
				;
			while(oFrom = oRequired.aFrom[i++]) {

				oWidgetFrom = oFrom.sName? this.getWidgetByName(oFrom.sName) : oWidget;

				if(!oWidgetFrom) {
					this.throwDependenceException(oFrom.sName);
				}

				if(oFrom.fFunction) {
					oWidget.addDependence(
						ZForms.createFunctionDependence(
							oWidgetFrom,
							{
								iType     : ZForms.Dependence.TYPE_REQUIRE,
								fFunction : oFrom.fFunction,
								iLogic    : iLogic,
								bInverse  : oFrom.bInverse
							}
							)
						);
				}
				else {
					oWidget.addDependence(
						ZForms.createRequiredDependence(
							oWidgetFrom,
							{
								iLogic : iLogic,
								iMin   : oFrom.iMin? oFrom.iMin : 1
							}
							)
						);
				}

			}

		},

		buildValidOrEnabledDependence : function(oWidget, oValid, iType) {

			var
				iLogic = this.getLogic(oValid),
				oOptionsAdd
				;

			if(oValid.sType) {
				oOptionsAdd = { sType : oValid.sType };
			}
			else if(oValid.rPattern) {
				oOptionsAdd = { rPattern : oValid.rPattern };
			}
			else if(oValid.fFunction) {
				oOptionsAdd = { fFunction : oValid.fFunction };
			}
			else if(oValid.oCompare) {
				oOptionsAdd = { oCompare : oValid.oCompare };
			}

			if(oOptionsAdd) {
				Common.Object.extend(
					oOptionsAdd,
					{
						sName          : oValid.sName,
						bInverse       : oValid.bInverse,
						sClassName     : oValid.sClassName,
						bCheckForEmpty : oValid.bCheckForEmpty
					}
					);
			}

			oValid.aFrom = this.__self.prependToArray(oOptionsAdd, oValid.aFrom);

			var
				i = 0,
				oFrom,
				oWidgetFrom
				;
			while(oFrom = oValid.aFrom[i++]) {

				oWidgetFrom = oFrom.sName? this.getWidgetByName(oFrom.sName) : oWidget;

				if(!oWidgetFrom) {
					this.throwDependenceException(oFrom.sName);
				}

				if(oFrom.sType && oFrom.sType == 'email' && iType == ZForms.Dependence.TYPE_VALID) {
					oWidget.addDependence(
						ZForms.createValidEmailDependence(
							oWidgetFrom,
							{
								iLogic     : iLogic,
								bInverse   : oFrom.bInverse,
								sClassName : oFrom.sClassName
							}
							)
						);
				}
				else if(oFrom.rPattern) {
					oWidget.addDependence(
						ZForms['create' + (iType == ZForms.Dependence.TYPE_VALID? 'Valid' : 'Enabled') + 'Dependence'](
							oWidgetFrom,
							{
								rPattern       : this.__self.toPattern(oFrom.rPattern),
								iLogic         : iLogic,
								bInverse       : oFrom.bInverse,
								sClassName     : oFrom.sClassName,
								bCheckForEmpty : oFrom.bCheckForEmpty
							}
							)
						);
				}
				else if(oFrom.oCompare) {

					if(oFrom.oCompare.sCondition && !ZForms.Dependence.COMPARE_FUNCTIONS[oFrom.oCompare.sCondition]) {
						ZForms.throwException('unsupported type of compare condition: "' + oFrom.oCompare.sCondition + '"');
					}

					oWidget.addDependence(
						ZForms['create' + (iType == ZForms.Dependence.TYPE_VALID? 'Valid' : 'Enabled') + 'CompareDependence'](
							oWidgetFrom,
							{
								sCondition : oFrom.oCompare.sCondition,
								mArgument  : oFrom.oCompare.sName?
									this.getWidgetByName(oFrom.oCompare.sName) :
									oFrom.oCompare.mValue,
								iLogic     : iLogic,
								bInverse   : oFrom.bInverse,
								sClassName : oFrom.sClassName,
								bCheckForEmpty : oFrom.bCheckForEmpty
							}
							)
						);

				}
				else if(oFrom.fFunction) {
					oWidget.addDependence(
						ZForms.createFunctionDependence(
							oWidgetFrom,
							{
								iType     : iType,
								fFunction : oFrom.fFunction,
								iLogic    : iLogic,
								bInverse  : oFrom.bInverse
							}
							)
						);
				}

			}

		},

		buildOptionsDependence : function(oWidget, oDepended) {

			var
				iLogic = this.getLogic(oDepended),
				oOptionsAdd
				;

			if(oDepended.aData) {
				oOptionsAdd = { aData : oDepended.aData };
			}
			else if(oDepended.fFunction) {
				oOptionsAdd = { fFunction : oDepended.fFunction };
			}

			if(oOptionsAdd) {
				Common.Object.extend(
					oOptionsAdd,
					{
						sName : oDepended.sName
					}
					);
			}

			oDepended.aFrom = this.__self.prependToArray(oOptionsAdd, oDepended.aFrom);

			var
				i = 0,
				j,
				oFrom,
				oWidgetFrom,
				aPatterns
				;
			while(oFrom = oDepended.aFrom[i++]) {

				oWidgetFrom = oFrom.sName? this.getWidgetByName(oFrom.sName) : oWidget;

				if(!oWidgetFrom) {
					this.throwDependenceException(oFrom.sName);
				}

				if(oFrom.aData) {

					aPatterns = [];
					j = 0;

					while(j < oFrom.aData.length) {
						aPatterns.push(
							{
								rSource      : this.__self.toPattern(oFrom.aData[j][0]),
								rDestination : this.__self.toPattern(oFrom.aData[j++][1])
							}
							);
					}

					oWidget.addDependence(
						ZForms.createOptionsDependence(
							oWidgetFrom,
							{
								aPatterns : aPatterns,
								iLogic    : iLogic
							}
							)
						);

				}
				else if(oFrom.fFunction) {
					oWidget.addDependence(
						ZForms.createFunctionDependence(
							oWidgetFrom,
							{
								iType     : ZForms.Dependence.TYPE_OPTIONS,
								fFunction : oFrom.fFunction,
								iLogic    : iLogic,
								bInverse  : oFrom.bInverse
							}
							)
						);
				}

			}

		},

		buildClassesDependence : function(oWidget, oClass) {

			var
				iLogic = this.getLogic(oClass),
				oOptionsAdd
				;

			if(oClass.fFunction) {
				oOptionsAdd = { fFunction : oClass.fFunction };
			}
			else if(oClass.aData) {
				oOptionsAdd = { aData : oClass.aData };
			}

			oClass.aFrom = this.__self.prependToArray(oOptionsAdd, oClass.aFrom);

			var
				i = 0,
				j,
				oFrom,
				oWidgetFrom,
				aPatternToClasses
				;
			while(oFrom = oClass.aFrom[i++]) {

				oWidgetFrom = oFrom.sName? this.getWidgetByName(oFrom.sName) : oWidget;

				if(!oWidgetFrom) {
					this.throwDependenceException(oFrom.sName);
				}

				if(oFrom.aData) {

					aPatternToClasses = [];
					j = 0;

					while(j < oFrom.aData.length) {
						aPatternToClasses.push(
							{
								rPattern   : this.__self.toPattern(oFrom.aData[j][0]),
								sClassName : oFrom.aData[j][1],
								bInverse   : oFrom.aData[j++][2]
							}
							);
					}

					oWidget.addDependence(
						ZForms.createClassDependence(
							oWidgetFrom,
							{
								aPatternToClasses : aPatternToClasses,
								iLogic            : iLogic
							}
							)
						);

				}
				else if(oFrom.fFunction) {
					oWidget.addDependence(
						ZForms.createFunctionDependence(
							oWidgetFrom,
							{
								iType     : ZForms.Dependence.TYPE_CLASS,
								fFunction : oFrom.fFunction,
								iLogic    : iLogic,
								bInverse  : oFrom.bInverse
							}
							)
						);
				}

			}

		},

		getLogic : function(oObject) {

			return oObject.sLogic == 'or'? ZForms.Dependence.LOGIC_OR : ZForms.Dependence.LOGIC_AND;

		},

		throwDependenceException : function(sName) {

			ZForms.throwException('Widget with name "' + sName + '" no exists');

		}

	},
	{

		prependToArray : function(oObject, aArray) {

			if(typeof(oObject) == 'undefined') {
				return aArray;
			}

			if(!(oObject instanceof Array)) {
				oObject = [oObject];
			}

			if(!(aArray instanceof Array)) {
				aArray = [];
			}

			return oObject.concat(aArray);

		},

		toPattern : function(mValue) {

			return mValue instanceof RegExp?
				mValue :
				new RegExp('^' + mValue + '$')
				;

		},

		getId : function(oElement) {

			return Common.Dom.getAttribute(oElement, 'id') || Common.Dom.getUniqueId(oElement);

		},

		aTypesToCreateWidgetFunction : {
			'form'             : 'Form',
			'text'             : 'TextInput',
			'password'         : 'TextInput',
			'file'             : 'TextInput',
			'hidden'           : 'TextInput',
			'number'           : 'NumberInput',
			'select'           : 'SelectInput',
			'combo'            : 'ComboInput',
			'date'             : 'DateInput',
			'submit'           : 'SubmitButton',
			'fieldset'         : 'Container',
			'checkboxgroup'    : 'CheckBoxGroup',
			'radiobuttongroup' : 'RadioButtonGroup',
			'state'            : 'StateInput',
			'sheet'            : 'Sheet',
			'button'           : 'Button',
			'buttonprev'       : 'Button',
			'buttonnext'       : 'Button',
			'buttonadd'        : 'Button',
			'buttonremove'     : 'Button',
			'buttonup'         : 'Button',
			'buttondown'       : 'Button',
			'slider'           : 'Slider',
			'slidervertical'   : 'SliderVertical'
		},

		rTypePattern : /zf-(form|text|number|select|combo|date|submit|fieldset|checkboxgroup|radiobuttongroup|state|sheet|slider|slidervertical|buttonprev|buttonnext|buttonadd|buttonremove|buttonup|buttondown|button)(\s+|$)/,

		CLASS_NAME_WIDGET : 'zf'

	}
	);
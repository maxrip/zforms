var ZForms = {

	EVENT_TYPE_ON_INIT          : 'zf:oninit',
	EVENT_TYPE_ON_CHANGE        : 'zf:onchange',
	EVENT_TYPE_ON_BEFORE_SUBMIT : 'zf:onbeforesubmit',
	EVENT_TYPE_ON_READY_CHANGE  : 'zf:onreadychange',

	// static widget creation methods

	createWidget : function() {

		return new arguments[0](
			arguments[1][0],
			arguments[1][1],
			arguments[1][2]
			);

	},

	createTextInput : function() {

		return this.createWidget(ZForms.Widget.Text, arguments);

	},

	createNumberInput : function() {

		return this.createWidget(ZForms.Widget.Text.Number, arguments);

	},

	createSelectInput : function() {

		return this.createWidget(ZForms.Widget.Select, arguments);

	},

	createComboInput : function() {

		return this.createWidget(ZForms.Widget.Text.Combo, arguments);

	},

	createContainer : function() {

		return this.createWidget(ZForms.Widget.Container, arguments);

	},

	createDateInput : function() {

		return this.createWidget(ZForms.Widget.Container.Date, arguments);

	},

	createInputGroup : function() {

		var oResult = this.createWidget(arguments[0], arguments[1]);

		if(arguments[1][3]) {
			for(var i = 0; i < arguments[1][3].length; i++) {
				oResult.addChild(
					this.createStateInput(arguments[1][3][i][0], arguments[1][3][i][1], arguments[1][2])
					);
			}
		}

		return oResult;

	},

	createStateInput : function() {

		return this.createWidget(ZForms.Widget.Text.State, arguments);

	},

	createCheckBoxGroup : function() {

		return this.createInputGroup(ZForms.Widget.Container.Group.CheckBox, arguments);

	},

	createRadioButtonGroup : function() {

		return this.createInputGroup(ZForms.Widget.Container.Group.RadioButton, arguments);

	},

	createSlider : function() {

		return this.createWidget(ZForms.Widget.Container.Slider, arguments);

	},

	createSliderVertical : function() {

		return this.createWidget(ZForms.Widget.Container.Slider.Vertical, arguments);

	},

	createButton : function() {

		return this.createWidget(ZForms.Widget.Button, arguments);

	},

	createSubmitButton : function() {

		return this.createWidget(ZForms.Widget.Button.Submit, arguments);

	},

	createSheet : function() {

		return this.createWidget(ZForms.Widget.Container.Sheet, arguments);

	},

	createSheetContainer : function() {

		return this.createWidget(ZForms.Widget.Container.SheetContainer, arguments);

	},

	createMultiplicator : function() {

		return this.createWidget(ZForms.Widget.Container.Multiplicator, arguments);

	},

	createForm : function() {

		this.aForms.push(this.createWidget(ZForms.Widget.Container.Form, arguments));

		return this.aForms[this.aForms.length - 1];

	},

	// static dependence creation methods

	createEnabledDependence : function(
		oWidget,
		oOptions
		) {

		return new this.Dependence.Enabled(
			oWidget,
			oOptions.rPattern,
			oOptions.iLogic,
			oOptions.bInverse,
			oOptions.bFocusOnEnable
			);

	},

	createRequiredDependence : function(
		oWidget,
		oOptions
		) {

		var oOptions = oOptions || {};

		return new this.Dependence.Required(
			oWidget,
			oOptions.rPattern?
				oOptions.rPattern :
				(oOptions.iMin > 1? new RegExp('\\S.{' + (oOptions.iMin - 2) + ',}\\S') : /\S+/),
			oOptions.iLogic,
			false,
			oOptions.iMin
			);

	},

	createValidDependence : function(
		oWidget,
		oOptions
		) {

		var oOptions = oOptions || {};

		return new this.Dependence.Valid(
			oWidget,
			oOptions.rPattern,
			oOptions.iLogic,
			oOptions.bInverse,
			oOptions.sClassName,
			oOptions.bCheckForEmpty
			);

	},

	createValidEmailDependence : function(
		oWidget,
		oOptions
		) {

		return this.createValidDependence(
			oWidget,
			Common.Object.extend(
				{
					rPattern : /^[a-zA-Z0-9][a-zA-Z0-9\.\-\_\~]*\@[a-zA-Z0-9\.\-\_]+\.[a-zA-Z]{2,4}$/
				},
				oOptions
				)
			);

	},

	createOptionsDependence : function(
		oWidget,
		oOptions
		) {

		var oOptions = oOptions || {};

		return new this.Dependence.Options(
			this.Dependence.TYPE_OPTIONS,
			oWidget,
			oOptions.aPatterns || [],
			oOptions.iLogic
			);

	},

	createClassDependence : function(
		oWidget,
		oOptions
		) {

		var oOptions = oOptions || {};

		return new this.Dependence.Class(
			oWidget,
			oOptions.aPatternToClasses || [],
			oOptions.iLogic
			);

	},

	createFunctionDependence : function(
		oWidget,
		oOptions
		) {

		var oOptions = oOptions || {};

		return new this.Dependence.Function(
			oOptions.iType || ZForms.Dependence.TYPE_VALID,
			oWidget,
			oOptions.fFunction || function() { return true; },
			oOptions.iLogic,
			oOptions.bInverse
			);

	},

	createCompareDependence : function(
		oWidget,
		oOptions
		) {

		var
			oOptions = oOptions || {},
			fFunction = function(oWidget, fFunction) {

				var bResult = (arguments.callee.iType == ZForms.Dependence.TYPE_VALID &&
					!arguments.callee.oOptions.bCheckForEmpty && arguments.callee.oWidget.getValue().isEmpty()
					) ||
					arguments.callee.oWidget.getValue()[arguments.callee.sFunctionName](
					arguments.callee.mArgument instanceof ZForms.Widget?
						arguments.callee.mArgument.getValue() :
						arguments.callee.mArgument
					);

				if(arguments.callee.iType == ZForms.Dependence.TYPE_VALID &&
				   arguments.callee.oOptions.sClassName) {
					fFunction.setResult(
						{
							bAdd       : !bResult,
							sClassName : arguments.callee.oOptions.sClassName
						}
						);
				}
				else if(arguments.callee.iType == ZForms.Dependence.TYPE_ENABLED &&
				   arguments.callee.oOptions.bFocusOnEnable) {
					fFunction.setResult(
						{
							bFocusOnEnable : bResult
						}
						);
				}

				return bResult;

			},
			mResult = new this.Dependence.Function(
				oOptions.iType,
				oWidget,
				fFunction,
				oOptions.iLogic,
				oOptions.bInverse
				)
			;

		fFunction.iType = oOptions.iType;
		fFunction.oWidget = oWidget;
		fFunction.mArgument = oOptions.mArgument;
		fFunction.sFunctionName = this.Dependence.COMPARE_FUNCTIONS[oOptions.sCondition || 'eq'];
		fFunction.oOptions = oOptions;

		if(!(oOptions.mArgument instanceof ZForms.Widget)) {
			return mResult;
		}

		return [
			mResult,
			new this.Dependence.Function(
				oOptions.iType,
				oOptions.mArgument,
				fFunction,
				oOptions.iLogic,
				oOptions.bInverse
				)
			];

	},

	createValidCompareDependence : function(
		oWidget,
		oOptions
		) {

		return this.createCompareDependence(
			oWidget,
			Common.Object.extend(
				{
					iType : this.Dependence.TYPE_VALID
				},
				oOptions
				)
			);

	},

	createEnabledCompareDependence : function(
		oWidget,
		oOptions
		) {

		return this.createCompareDependence(
			oWidget,
			Common.Object.extend(
				{
					iType : this.Dependence.TYPE_ENABLED
				},
				oOptions
				)
			);

	},

	buildForm : function(oElement) {

		return new this.Builder(oElement).build();

	},

	throwException : function(sMessage) {

		throw('ZForms: ' + sMessage);

	},

	aForms : [],

	/**
	 * @param {String} sId
	 * @returns {ZForms.Widget.Container.Form}
	 */
	getFormById : function(sId) {

		return this.aForms[sId];

	},

	bInited : false,

	isInited : function() {

		return this.bInited;

	},

	attachObserver : function(
		mEventType,
		mObserver,
		mObservable,
		bNotifyAtOnce
		) {

		Common.Observable.attach(mEventType, mObserver, mObservable || this);

		if((mEventType == this.EVENT_TYPE_ON_INIT && mObservable == this && this.isInited()) ||
			bNotifyAtOnce
			) {
			mObserver(mEventType, mObservable);
		}
		else if(mEventType == this.EVENT_TYPE_ON_READY_CHANGE) {
			mObserver(mEventType, mObservable, mObservable.isReadyForSubmit());
		}

	},

	detachObserver : function(
		mEventType,
		mObserver,
		mObservable
		) {

		Common.Observable.detach(mEventType, mObserver, mObservable);

	},

	notifyObservers : function(sEventType, oObservable, mData) {

		Common.Observable.notify(sEventType, oObservable, mData);

	}

};
var ZForms = {

	EVENT_TYPE_ON_INIT          : 'oninit',
	EVENT_TYPE_ON_CHANGE        : 'onchange',
	EVENT_TYPE_ON_BEFORE_SUBMIT : 'onbeforesubmit',

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
	
		return this.createWidget(ZForms.Widget.Container.Form, arguments);
	
	},
	
	// static dependence creation methods
	
	createEnableDependence : function(
		oWidget,
		rPattern,
		iLogic,
		bInverse
		) {
		
		return new this.Dependence(
			this.Dependence.TYPE_ENABLE,
			oWidget,
			rPattern,
			iLogic,
			bInverse
			);
		
	},
	
	createRequiredDependence : function(
		oWidget,
		iLogic,
		iMin
		) {
		
		return new this.Dependence.Required(
			oWidget,
			iMin? new RegExp('\\S{' + iMin + ',}') : /\S+/,
			iLogic,
			false,
			iMin
			);
	
	},		
	
	createValidDependence : function(
		oWidget,
		rPattern,
		iLogic,
		bInverse
		) {
	
		return new this.Dependence.Valid(
			oWidget,
			rPattern,
			iLogic,
			bInverse
			);
			
	},
	
	createValidEmailDependence : function(oWidget) {

		return this.createValidDependence(
			oWidget,
			/^[a-zA-Z0-9][a-zA-Z0-9\.\-\_\~]*\@[a-zA-Z0-9\.\-\_]+\.[a-zA-Z]{2,4}$/
			);
			
	},
	
	createOptionsDependence : function(
		oWidget,
		aPatterns,
		iLogic
		) {

		return new this.Dependence.Options(
			this.Dependence.TYPE_OPTIONS,
			oWidget,
			aPatterns,
			iLogic
			);

	},
	
	createClassDependence : function(
		oWidget,
		aPatternToClasses,
		iLogic
		) {

		return new this.Dependence.Class(
			oWidget,
			aPatternToClasses,
			iLogic
			);

	},
	
	createFunctionDependence : function(
		iType,
		oWidget,
		fFunction,
		iLogic,
		bInverse
		) {

		return new this.Dependence.Function(
			iType,
			oWidget,
			fFunction,
			iLogic,
			bInverse
			);

	},
	
	createCompareDependence : function(
		sType,
		oWidget,
		sCondition,
		mArgument,
		iLogic,
		bInverse
		) {

		var		
			fFunction = function() {

				return (arguments.callee.sType == ZForms.Dependence.TYPE_VALID &&
					(arguments.callee.oWidget.getValue().isEmpty() || (arguments.callee.mArgument instanceof ZForms.Widget && arguments.callee.mArgument.getValue().isEmpty()))
					) ||
					arguments.callee.oWidget.getValue()[arguments.callee.sFunctionName](
					arguments.callee.mArgument instanceof ZForms.Widget?
						arguments.callee.mArgument.getValue() :
						arguments.callee.mArgument
					);

			},
			mResult = new this.Dependence.Function(
				sType,
				oWidget,
				fFunction,
				iLogic,
				bInverse
				)
			;
		
		fFunction.sType = sType;
		fFunction.oWidget = oWidget;
		fFunction.mArgument = mArgument;
		fFunction.sFunctionName = this.Dependence.COMPARE_FUNCTIONS[sCondition || '='];
			
		if(!(mArgument instanceof ZForms.Widget)) {
			return mResult;
		}
				
		return [
			mResult,
			new this.Dependence.Function(
				sType,
				mArgument,
				fFunction,
				iLogic,
				bInverse
				)
			];
	
	},
	
	createValidCompareDependence : function(	
		oWidget,
		sCondition,
		mArgument,
		iLogic,
		bInverse
		) {

		return this.createCompareDependence(
			this.Dependence.TYPE_VALID,
			oWidget,
			sCondition,
			mArgument,
			iLogic,
			bInverse
			);

	},
	
	createEnableCompareDependence : function(	
		oWidget,
		sCondition,
		mArgument,
		iLogic,
		bInverse
		) {

		return this.createCompareDependence(
			this.Dependence.TYPE_ENABLE,
			oWidget,
			sCondition,
			mArgument,
			iLogic,
			bInverse
			);
			
	},
	
	// creation builder method
	
	createBuilder : function(aForm) {
	
		return new this.Builder(aForm);
	
	},
	
	// forms store
	
	aForms : [],

	getFormById : function(sId) {

		return this.aForms[sId];
			
	}

};
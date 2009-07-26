/**
 * @class base class of widgets
 */
ZForms.Widget = Abstract.inheritTo(
	/** @lends ZForms.Widget.prototype */
	{

		/**
		* @constructs
		* @param {Element} oElement
		* @param {Element} oClassElement
		* @param {Object} oOptions
		*/
		__constructor : function(
			oElement,
			oClassElement,
			oOptions
			) {

			this.oElement = oElement;
			this.oClassElement = oClassElement || oElement;

			this.oOptions = oOptions?
				Common.Object.extend(
					this.getDefaultOptions(),
					oOptions,
					true
					) :
				this.getDefaultOptions()
				;

			this.sId = Common.Dom.getAttribute(oElement, 'id') || Common.Dom.getUniqueId(oElement);
			this.oDependenceProcessor = new ZForms.DependenceProcessor(this);
			this.aObservers = [];
			this.oParent = null;
			this.oForm = null;
			this.bEnabled = true;
			this.bRequired = false;
			this.bValid = true;
			this.oMultiplier = null;

			this.oValue = this.createValue();
			this.setValueFromElement(true);
			this.oInitialValue = this.oValue.clone();
			this.oLastProcessedValue = this.oValue.clone();
			this.bInitialValueChanged = false;
			this.bInited = false;

			this.addHandlers();

		},

		getDefaultOptions : function() {

			return {
				bTemplate    : false,
				bFocusOnInit : false
				};

		},

		createValue : function(mValue) {

			return new ZForms.Value(mValue);

		},

		addHandlers : function() {

			if(this.isTemplate()) {
				return;
			}

			var oThis = this;

			function process(oEvent) {

				var oEvent = Common.Event.normalize(oEvent);

				oEvent.cancelBubble = true;

				oThis.processEvents(true);

			}

			Common.Event.add(
				this.oElement,
				this.getEventList(),
				process
				);

		},

		getEventList : function() {

			return [];

		},

		processEvents : function(
			bUpdateSubmit,
			bStateChanged,
			bByParent
			) {

			this.setValueFromElement();

			if(!(bStateChanged || this.isChanged()) ||
				this.isTemplate()
				) {
				return;
			}
			else {

				this.checkForInitialValueChanged();
				this.updateLastProcessedValue();

			}

			this.notifyObservers();

			ZForms.notifyObservers(ZForms.EVENT_TYPE_ON_CHANGE, this);

			if(!bByParent) {

				if(this.oParent) {
					this.oParent.processEvents(bUpdateSubmit, true);
				}
				else if(bUpdateSubmit && this.oForm) { // tested code
					this.oForm.updateSubmit();
				}

			}

		},

		isChanged : function() {

			return !this.oValue.isEqual(this.oLastProcessedValue);

		},

		updateLastProcessedValue : function() {

			this.oLastProcessedValue = this.oValue.clone();

		},

		isInitialValueChanged : function() {

			return this.bInitialValueChanged;

		},

		checkForInitialValueChanged : function() {

			if(!this.oForm) {
				return;
			}

			if(!this.isInitialValueChanged() &&
				!this.compareValueWithInitialValue()
				) {

				this.oForm.increaseChangedCounter();
				this.bInitialValueChanged = true;
				this.addClass(this.__self.CLASS_NAME_CHANGED);

			}
			else if(this.isInitialValueChanged() &&
				this.compareValueWithInitialValue()
				) {

				this.oForm.decreaseChangedCounter();
				this.bInitialValueChanged = false;
				this.removeClass(this.__self.CLASS_NAME_CHANGED);

			}

		},

		compareValueWithInitialValue : function() {

			return this.oValue.isEqual(this.oInitialValue);

		},

		init : function() {

			if(this.isTemplate()) {
				return;
			}

			if(this.oElement.disabled) {
				this.disable();
			}

			this.processEvents(false, true);

			if(this.oMultiplier) {
				this.oMultiplier.init();
			}

			if(this.oOptions.bFocusOnInit) {
				this.focus();
			}

			this.bInited = true;

			ZForms.notifyObservers(ZForms.EVENT_TYPE_ON_INIT, this);

		},

		isInited : function() {

			return this.bInited;

		},

		getValue : function() {

			return this.oValue;

		},

		setValue : function(oValue) {

			if(!this.hasValue()) {
				return;
			}

			this.oValue = oValue;

			this.processEvents(true);

		},

		setValueFromElement : function() {},

		hasValue : function() {

			return true;

		},

		getId : function() {

			return this.sId;

		},

		setId : function(sId) {

			this.sId = sId;

		},

		getName : function() {

			return this.oElement.name;

		},

		isTemplate : function() {

			return this.oOptions.bTemplate;

		},

		addClass : function(sClassName, oElement) {

			Common.Class.add(oElement? oElement : this.oClassElement, sClassName);

		},

		removeClass : function(sClassName, oElement) {

			Common.Class.remove(oElement? oElement : this.oClassElement, sClassName);

		},

		replaceClass : function(sClassNameFrom, sClassNameTo, oElement) {

			Common.Class.replace(oElement? oElement : this.oClassElement, sClassNameFrom, sClassNameTo);

		},

		disable : function(bByParent) {

			if(!this.isEnabled()) {
				return false;
			}

			this.bEnabled = false;
			this.oElement.disabled = true;
			this.oClassElement.disabled = true;

			this.addClass(this.__self.CLASS_NAME_DISABLED);

			if(bByParent) {
				this.processEvents(true, true, true);
			}

			if(this.oMultiplier) {
				this.oMultiplier.disableByOuter();
			}

			return true;

		},

		enable : function(bByParent) {

			if(!this.allowEnable()) {
				return false;
			}

			this.bEnabled = true;
			this.oElement.disabled = false;
			this.oClassElement.disabled = false;

			this.removeClass(this.__self.CLASS_NAME_DISABLED);

			if(bByParent) {

				this.processEvents(true, true, true);
				this.updateByObservable(true);

			}

			if(this.oMultiplier) {
				this.oMultiplier.enableByOuter();
			}

			return true;

		},

		allowEnable : function() {

			return !this.isEnabled() &&
				!(this.oParent && !this.oParent.isEnabled());

		},

		isEnabled : function() {

			return this.bEnabled;

		},

		setRequired : function() {

			this.replaceClass(this.__self.CLASS_NAME_REQUIRED_OK, this.__self.CLASS_NAME_REQUIRED);

			this.bRequired = true;

		},

		unsetRequired : function() {

			this.replaceClass(this.__self.CLASS_NAME_REQUIRED, this.__self.CLASS_NAME_REQUIRED_OK);

			this.bRequired = false;

		},

		isRequired : function() {

			return this.bRequired;

		},

		setValid : function() {

			if(this.hasValue() && this.getValue().isEmpty()) {
				this.removeClass(this.bValid? this.__self.CLASS_NAME_INVALID_OK : this.__self.CLASS_NAME_INVALID);
			}
			else {
				this.replaceClass(this.__self.CLASS_NAME_INVALID, this.__self.CLASS_NAME_INVALID_OK);
			}

			this.bValid = true;

		},

		setInvalid : function() {

			this.replaceClass(this.__self.CLASS_NAME_INVALID_OK, this.__self.CLASS_NAME_INVALID);

			this.bValid = false;

		},

		isValid : function() {

			return this.bValid;

		},

		isReadyForSubmit : function() {

			return !this.isEnabled() ||
				(
					!this.isRequired() &&
					(
						!this.oForm.oOptions.bCheckForValid || this.isValid()
					)
				);

		},

		setParent : function(oParent) {

			this.oParent = oParent;

		},

		setForm : function(oForm) {

			if(this.oForm) {
				return;
			}

			this.oForm = oForm;

			oForm.addWidget(this);

		},

		hide : function() {

			this.addClass(this.__self.CLASS_NAME_INVISIBLE);

		},

		show : function() {

			this.removeClass(this.__self.CLASS_NAME_INVISIBLE);

		},

		focus : function() {

			var oAncestor = this.oParent;

			do {

				if(oAncestor instanceof ZForms.Widget.Container.Sheet) {
					oAncestor.oParent.select(oAncestor);
				}

				oAncestor = oAncestor.oParent;

			}
			while(oAncestor);

			try {
				this.oElement.focus();
			}
			catch(oException){};

		},

		attachObserver : function(oObserver) {

			this.aObservers.push(oObserver);

		},

		detachObserver : function(oObserver) {

			this.aObservers.remove(oObserver);

		},

		detachObservers : function() {

			for(var i = 0, aDependencies, oObserver; i < this.aObservers.length;) {

				if(this.aObservers[i] == this) {

					i++;
					continue;

				}

				oObserver = this.aObservers[i];

				aDependencies = this.aObservers[i].getDependencies();

				for(var j = 0; j < aDependencies.length; j++) {
					if(aDependencies[j].getFrom() == this) {
						this.aObservers[i].removeDependence(aDependencies[j]);
					}
				}

				this.detachObserver(oObserver);

				// Define by parent, observer is removed or not

				if(oObserver.oParent) {
					oObserver.updateByObservable();
				}

			}

		},

		notifyObservers : function() {

			for(var i = 0; i < this.aObservers.length; i++) {
				this.aObservers[i].updateByObservable();
			}

		},

		updateByObservable : function(bByParent) {

			this.oDependenceProcessor.process();

			if(!bByParent && this.oParent) {
				this.oParent.oDependenceProcessor.process();
			}

		},

		addDependence : function(mDependence) {

			if(mDependence instanceof Array) {

				for(var i = 0; i < mDependence.length; i++) {
					this.addDependence(mDependence[i]);
				}

				return;

			}

			mDependence.getFrom().attachObserver(this);

			this.oDependenceProcessor.addDependence(mDependence);

		},

		removeDependence : function(oDependence) {

			this.oDependenceProcessor.removeDependence(oDependence);

		},

		getDependencies : function() {

			return this.oDependenceProcessor.getDependencies();

		},

		getMultiplier : function() {

			return this.oMultiplier;

		},

		setMultiplier : function(oMultiplier) {

			this.oMultiplier = oMultiplier;

		},

		updateElements : function(iIndex) {

			this.oElement = document.getElementById(iIndex > 0?
				this.oElement.id.match(ZForms.Widget.Container.Multiplicator.REG_EXP_REPLACE)[1] + '_' + iIndex :
				this.oElement.id
				);

			this.oClassElement = document.getElementById(iIndex > 0?
				this.oClassElement.id.match(ZForms.Widget.Container.Multiplicator.REG_EXP_REPLACE)[1] + '_' + iIndex :
				this.oClassElement.id
				);

			this.updateId(this.oElement.id);

			if(this.oElement.attachEvent) {

				this.addHandlers();
				this.addExtendedHandlers();

			}

		},

		updateId : function(sId) {

			this.oForm.removeWidget(this);

			this.setId(sId);

			this.oForm.addWidget(this);

		},

		addId : function(iIndex) {

			this.setId(this.addIdToElement(this.oElement, this.__self.ID_PREFIX, iIndex));
			this.addIdToElement(this.oClassElement, this.__self.ROW_ID_PREFIX, iIndex);

			if(this.oMultiplier) {
				this.oMultiplier.addId(iIndex);
			}

		},

		addIdToElement : function(oElement, sPrefix, iIndex) {

			if(!!oElement.getAttribute('id')) {
				return oElement.getAttribute('id');
			}

			var sId = sPrefix + Common.Dom.getUniqueId(oElement) + (iIndex > 0? '_' + iIndex : '');

			oElement.setAttribute('id', sId);

			return sId;

		},

		addChild : function(oChild) {

			return oChild;

		},

		getCountChildrenByPattern : function() {

			return 0;

		},

		destruct : function() {

			this.oElement = null;
			this.oClassElement = null;

			if(this.oMultiplier) {
				this.oMultiplier.destruct();
			}

		},

		afterClone : function() {

			this.processEvents(true, true);

		},

		prepareForSubmit : function() {},

		addExtendedHandlers : function() {},

		removeChild : function(oChild) {},

		removeChildren : function(oChild) {},

		enableOptionsByValue : function(aPatternGroups, iLogic) {},

		clone : function(
			oElement,
			oClassElement,
			iIndex
			) {

			var oNewOptions = Common.Object.extend(
				{
					bTemplate : false
				},
				this.oOptions
				);

			return new this.__self(
				oElement,
				oClassElement,
				oNewOptions
				);

		}

	},
	/** @lends ZForms.Widget */
	{

		CLASS_NAME_REQUIRED         : 'zf-required',
		CLASS_NAME_REQUIRED_OK      : 'zf-required-ok',
		CLASS_NAME_INVALID          : 'zf-invalid',
		CLASS_NAME_INVALID_OK       : 'zf-invalid-ok',
		CLASS_NAME_DISABLED         : 'zf-disabled',
		CLASS_NAME_INVISIBLE        : 'zf-invisible',
		CLASS_NAME_SELECTED         : 'zf-selected',
		CLASS_NAME_HIDDEN           : 'zf-hidden',
		CLASS_NAME_SELECTED_INITIAL : 'zf-selected-initial',
		CLASS_NAME_CHANGED          : 'zf-changed',

		KEY_CODE_ARROW_RIGHT : 39,
		KEY_CODE_ARROW_LEFT  : 37,
		KEY_CODE_ARROW_UP    : 38,
		KEY_CODE_ARROW_DOWN  : 40,
		KEY_CODE_PAGE_UP     : 33,
		KEY_CODE_PAGE_DOWN   : 34,
		KEY_CODE_HOME        : 36,
		KEY_CODE_END         : 35,
		KEY_CODE_ENTER       : 13,
		KEY_CODE_TAB         : 9,
		KEY_CODE_ESCAPE      : 27,

		DOM_EVENT_TYPE_KEYUP        : 'keyup',
		DOM_EVENT_TYPE_KEYDOWN      : 'keydown',
		DOM_EVENT_TYPE_KEYPRESS     : 'keypress',
		DOM_EVENT_TYPE_CLICK        : 'click',
		DOM_EVENT_TYPE_BLUR         : 'blur',
		DOM_EVENT_TYPE_FOCUS        : 'focus',
		DOM_EVENT_TYPE_CHANGE       : 'change',
		DOM_EVENT_TYPE_MOUSEDOWN    : 'mousedown',
		DOM_EVENT_TYPE_MOUSEUP      : 'mouseup',
		DOM_EVENT_TYPE_MOUSEMOVE    : 'mousemove',
		DOM_EVENT_TYPE_SELECTSTART  : 'selectstart',
		DOM_EVENT_TYPE_UNLOAD       : 'unload',
		DOM_EVENT_TYPE_BEFOREUNLOAD : 'beforeunload',
		DOM_EVENT_TYPE_PASTE        : 'paste',

		ID_PREFIX     : 'input-',
		ROW_ID_PREFIX : 'row-'

	}
	);
ZForms.Widget.Container.Form = ZForms.Widget.Container.inheritTo(
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

			this.oForm = this;

			this.aWidgets = [];
			this.aWidgets[this.getId()] = this;
			this.aSubmits = [];		

			this.iChangedCounter = 0;
			this.bSubmitted = false;
	
			this.addExtendedHandlers();
	
			ZForms.aForms[this.getId()] = this;

		},
		
		getDefaultOptions : function() {
		
			return Common.Object.extend(
				this.__base(),
				{
					bUpdatableSubmit : true,
					bCheckForValid   : true,
					bCheckForChanged : false,
					bPreventSubmit   : false			
				},
				true
				);
		
		},

		addExtendedHandlers : function() {

			var oThis = this;

			Common.Event.add(
				this.oElement,
				this.__self.DOM_EVENT_TYPE_SUBMIT,
				function(oEvent) {

					if(!oThis.checkForSubmit() || oThis.bSubmitted) {
						return Common.Event.cancel(oEvent);
					}

					oThis.notifyOuterObservers(ZForms.EVENT_TYPE_ON_BEFORE_SUBMIT);

					if(oThis.oOptions.bPreventSubmit) {
						return Common.Event.cancel(oEvent);
					}
					
					oThis.prepareForSubmit();
					
					oThis.bSubmitted = true;

				}
				);

			Common.Event.add(
				window,
				Common.Browser.isIE()? this.__self.DOM_EVENT_TYPE_BEFOREUNLOAD : this.__self.DOM_EVENT_TYPE_UNLOAD,
				function() {

					oThis.destruct();

				}
				);

		},

		checkForSubmit : function() {

			if(this.isReadyForSubmit()) {
				return true;
			}

			this.getFirstErrorWidget().focus();

			this.addClass(this.__self.CLASS_NAME_SUBMITTED);

			return false;

		},

		init : function() {

			var oThis = this;

			setTimeout(
				function() {
				
					ZForms.Widget.Container.prototype.init.call(oThis);
					oThis.updateSubmit();
					
				},
				0
				);

		},

		setForm : function(oForm) {},

		increaseChangedCounter : function() {

			this.iChangedCounter++;

		},

		decreaseChangedCounter : function() {

			this.iChangedCounter--;

		},

		isChanged : function() {

			return this.iChangedCounter > 0;

		},

		addChild : function(oChild) {

			oChild.setForm(this);

			return this.__base(oChild);

		},

		addSubmit : function(oSubmit) {

			if(!(oSubmit instanceof ZForms.Widget.Button.Submit)) {
				return;
			}

			this.aSubmits.push(oSubmit);

		},

		updateSubmit : function() {

			if(!(this.oOptions.bUpdatableSubmit && this.aSubmits.length > 0)) {
				return;
			}

			if(this.shouldEnableSubmit()) {
				this.enableSubmit();
			}
			else {
				this.disableSubmit();
			}

		},

		shouldEnableSubmit : function() {

			return this.isReadyForSubmit() &&
				(!this.oOptions.bCheckForChanged || this.isChanged());

		},

		enableSubmit : function() {

			for(var i = 0; i < this.aSubmits.length; i++) {
				this.aSubmits[i].enable();
			}

		},

		disableSubmit : function() {

			for(var i = 0; i < this.aSubmits.length; i++) {
				this.aSubmits[i].disable();
			}

		},

		addWidget : function(oWidget) {

			this.aWidgets[oWidget.getId()] = oWidget;

		},

		removeWidget : function(oWidget) {

			delete this.aWidgets[oWidget.getId()];

		},

		getWidgetById : function(sId) {

			return this.aWidgets[sId];

		},

		getWidgets : function() {

			return this.aWidgets;

		},

		isReadyForSubmit : function() {

			var aWidgets = this.aWidgets;

			for(var sId in aWidgets) {

				if(!aWidgets.hasOwnProperty(sId) ||
					aWidgets[sId] == this
					) {
					continue;
				}

				if(!aWidgets[sId].isReadyForSubmit()) {
					return false;
				}

			}

			return true;

		},

		getFirstErrorWidget : function() {

			for(var sId in this.aWidgets) {

				if(!this.aWidgets.hasOwnProperty(sId)) {
					continue;
				}

				oWidget = this.aWidgets[sId];

				if(oWidget.isEnabled() &&
					(oWidget.bRequired ||
						(this.oOptions.bCheckForValid && !oWidget.bValid)
						)
					) {
					return oWidget;
				}

			}

		},
		
		reset : function() {
		
			this.oElement.reset();
		
		}

	},
	{	
	
		CLASS_NAME_SUBMITTED : 'submitted',

		DOM_EVENT_TYPE_SUBMIT : 'submit'
		
	}
	);
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
			this.oCurrentSubmit = null;
			this.oHiddenSubmitElement = null;

			this.iChangedCounter = 0;
			this.bReadyForSubmit = true;
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

					ZForms.notifyObservers(ZForms.EVENT_TYPE_ON_BEFORE_SUBMIT, oThis);

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

			var oFirstErrorWidget = this.getFirstErrorWidget();
			if(oFirstErrorWidget) {
				oFirstErrorWidget.focus();
			}

			this.addClass(this.__self.CLASS_NAME_SUBMITTED);

			return false;

		},

		init : function() {

			var oThis = this;

			setTimeout(
				function() {

					oThis.addClass(oThis.__self.CLASS_NAME_INITED);
					ZForms.Widget.Container.prototype.init.call(oThis);
					oThis.updateSubmit(true);

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

		updateSubmit : function(bAlways) {

			var bReadyForSubmit = this.isReadyForSubmit(true);

			if(!bAlways && bReadyForSubmit == this.bReadyForSubmit) {
				return;
			}

			this.bReadyForSubmit = bReadyForSubmit;

			if(this.oOptions.bUpdatableSubmit && this.aSubmits.length > 0) {

				if(bReadyForSubmit) {
					this.enableSubmit();
				}
				else {
					this.disableSubmit();
				}

			}

			ZForms.notifyObservers(ZForms.EVENT_TYPE_ON_READY_CHANGE, this, bReadyForSubmit);

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

		isReadyForSubmit : function(bNeedFullCheck) {

			if(!bNeedFullCheck) {
				return this.bReadyForSubmit;
			}

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

			return !this.oOptions.bCheckForChanged || this.isChanged();

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

		},

		prepareForSubmit : function() {

			this.__base();

			if(this.oHiddenSubmitElement) {
				this.oHiddenSubmitElement.parentNode.remove(this.oHiddenSubmitElement);
			}

			if(this.oCurrentSubmit && this.oCurrentSubmit.oOptions.bDisableOnSubmit) {
				this.oHiddenSubmitElement = this.oElement.appendChild(
					Common.Dom.createElement(
						'input',
						{
							type  : 'hidden',
							name  : this.oCurrentSubmit.oElement.name,
							value : this.oCurrentSubmit.oElement.value
						}
						)
					);
				this.oCurrentSubmit = null;
			}

		},

		setCurrentSubmit : function(oSubmit) {

			this.oCurrentSubmit = oSubmit;

		}

	},
	{

		CLASS_NAME_INITED    : 'zf-inited',
		CLASS_NAME_SUBMITTED : 'zf-submitted',

		DOM_EVENT_TYPE_SUBMIT : 'submit'

	}
	);
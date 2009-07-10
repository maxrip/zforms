ZForms.Widget.Container = ZForms.Widget.inheritTo(
	{

		__constructor : function(
			oElement,
			oClassElement,
			oOptions
			) {

			this.aChildren = [];

			this.__base(
				oElement,
				oClassElement,
				oOptions
				);


		},

		addChild : function(
			oChild,
			iIndex
			) {

			if(iIndex > -1 && iIndex < this.aChildren.length) {
				this.aChildren.splice(iIndex, 0, oChild);
			}
			else {
				this.aChildren.push(oChild);
			}

			oChild.setParent(this);

			if(this.oForm) {
				oChild.setForm(this.oForm);
			}

			return oChild;

		},

		removeChild : function(oChild) {

			oChild.detachObservers();
			oChild.removeChildren();

			this.aChildren.remove(oChild);

			if(this.oForm) {

				this.oForm.removeWidget(oChild);

				if(oChild.isInitialValueChanged()) {
					this.oForm.decreaseChangedCounter();
				}

			}

			// Set parent to null to define later, on detach observers, should update

			oChild.setParent(null);

			oChild = null;

		},

		removeChildren : function() {

			while(this.aChildren.length > 0) {
				this.removeChild(this.aChildren[0]);
			}

		},

		getChildren : function() {

			return this.aChildren;

		},

		setForm : function(oForm) {

			this.__base(oForm);

			for(var i = 0, iLength = this.aChildren.length; i < iLength; i++) {
				this.aChildren[i].setForm(oForm);
			}

		},

		disable : function(bByParent) {

			if(!this.__base(bByParent)) {
				return false;
			}

			for(var i = 0, iLength = this.aChildren.length; i < iLength; i++) {
				this.aChildren[i].disable(true);
			}

			return true;

		},

		enable : function(bByParent) {

			if(!this.allowEnable()) {
				return false;
			}

			this.bEnabled = true;

			for(var i = 0, iLength = this.aChildren.length; i < iLength; i++) {

				this.aChildren[i].enable(true);
				this.aChildren[i].updateByObservable(true);

			}

			this.bEnabled = false;

			this.__base(bByParent);

			return true;

		},

		isValid : function() {

			if(!this.__base()) {
				return false;
			}

			for(var i = 0, iLength = this.aChildren.length; i < iLength; i++) {
				if(!this.aChildren[i].isValid() && this.aChildren[i].isEnabled()) {
					return false;
				}
			}

			return true;

		},

		isRequired : function() {

			if(this.__base()) {
				return true;
			}

			for(var i = 0, iLength = this.aChildren.length; i < iLength ; i++) {
				if(this.aChildren[i].isRequired() && this.aChildren[i].isEnabled()) {
					return true;
				}
			}

			return false;

		},

		init : function() {

			for(var i = 0, iLength = this.aChildren.length; i < iLength; i++) {
				this.aChildren[i].init();
			}

			this.__base();

		},

		afterClone : function() {

			this.__base();

			for(var i = 0, iLength = this.aChildren.length; i < iLength; i++) {
				this.aChildren[i].afterClone();
			}

		},

		hasValue : function() {

			return false;

		},

		isChanged : function() {

			return true;

		},

		focus : function() {

			if(this.aChildren.length > 0) {
				this.aChildren[0].focus();
			}

		},

		getCountChildrenByPattern : function(sPattern) {

			var iResult = 0;

			for(var i = 0, iLength = this.aChildren.length; i < iLength; i++) {

				if(!this.aChildren[i].isEnabled()) {
					continue;
				}

				if(this.aChildren[i] instanceof ZForms.Widget.Container) {
					if(this.aChildren[i].getCountChildrenByPattern(sPattern) > 0) {
						iResult++;
					}
				}
				else if(this.aChildren[i].getValue().match(sPattern)) {
					iResult++;
				}

			}

			return iResult;

		},

		updateElements : function(iIndex) {

			this.__base(iIndex);

			for(var i = 0, iLength = this.aChildren.length; i < iLength; i++) {
				this.aChildren[i].updateElements(iIndex);
			}

		},

		addId : function(iIndex) {

			this.__base(iIndex);

			for(var i = 0, iLength = this.aChildren.length; i < iLength; i++) {
				this.aChildren[i].addId(iIndex);
			}

		},

		clone : function(
			oElement,
			oClassElement,
			iIndex
			) {
			
			var oResult = this.__base(
				oElement,
				oClassElement,
				iIndex
				);

			this.cloneChildren(
				oResult,
				iIndex
				);

			return oResult;

		},

		cloneChildren : function(
			oParent,
			iIndex
			) {

			for(var i = 0, iLength = this.aChildren.length; i < iLength; i++) {
				oParent.addChild(
					this.aChildren[i].clone(
						document.getElementById(this.aChildren[i].oElement.id.match(ZForms.Widget.Container.Multiplicator.REG_EXP_REPLACE)[1] + '_' + iIndex),
						document.getElementById(this.aChildren[i].oClassElement.id.match(ZForms.Widget.Container.Multiplicator.REG_EXP_REPLACE)[1] + '_' + iIndex),
						iIndex
						)
					);
			}

		},

		destruct : function() {

			for(var i = 0, iLength = this.aChildren.length; i < iLength; i++) {
				this.aChildren[i].destruct();
			}

			this.__base();

		},

		prepareForSubmit : function() {

			for(var i = 0, iLength = this.aChildren.length; i < iLength; i++) {
				this.aChildren[i].prepareForSubmit();
			}

			this.__base();

		}

	}
	);
ZForms.Multiplier = Abstract.inheritTo(
	{

		__constructor : function(
			oMultiplicator,
			oWidget
			) {

			this.oMultiplicator = oMultiplicator;
			this.oWidget = oWidget;

			this.bCanAdd = true;
			this.bCanRemove = true;
			this.bCanUp = true;
			this.bCanDown = true;

			this.oAddButton = null;
			this.oRemoveButton = null;
			this.oUpButton = null;
			this.oDownButton = null;

			this.bDisabledByOuter = false;

		},

		addAddButton : function(oButton) {

			this.oAddButton = oButton;

			var oThis = this;

			oButton.setHandler(
				function() {

					oThis.oMultiplicator.add(oThis.oWidget);

					return false;

				}
			);

		},

		addRemoveButton : function(oButton) {

			this.oRemoveButton = oButton;

			var oThis = this;

			oButton.setHandler(
				function() {

					oThis.oMultiplicator.remove(oThis.oWidget);

					return false;

				}
			);

		},

		addUpButton : function(oButton) {

			this.oUpButton = oButton;

			var oThis = this;

			oButton.setHandler(
				function() {

					oThis.oMultiplicator.up(oThis.oWidget);

					return false;

				}
			);

		},

		addDownButton : function(oButton) {

			this.oDownButton = oButton;

			var oThis = this;

			oButton.setHandler(
				function() {

					oThis.oMultiplicator.down(oThis.oWidget);

					return false;

				}
			);

		},

		enableByOuter : function() {

			this.bDisabledByOuter = false;

			if(this.bCanAdd) {
				this.enableAdd();
			}

			if(this.bCanRemove) {
				this.enableRemove();
			}

		},

		disableByOuter : function() {

			this.bDisabledByOuter = true;

			if(this.oAddButton) {
				this.oAddButton.disable();
			}

			if(this.oRemoveButton) {
				this.oRemoveButton.disable();
			}

		},

		enableAdd : function() {

			this.bCanAdd = true;

			if(this.bDisabledByOuter) {
				return;
			}

			if(this.oAddButton) {
				this.oAddButton.enable();
			}

		},

		disableAdd : function() {

			this.bCanAdd = false;

			if(this.oAddButton) {
				this.oAddButton.disable();
			}

		},

		enableRemove : function() {

			this.bCanRemove = true;

			if(this.bDisabledByOuter) {
				return;
			}

			if(this.oRemoveButton) {
				this.oRemoveButton.enable();
			}

		},

		disableRemove : function() {

			this.bCanRemove = false;

			if(this.oRemoveButton) {
				this.oRemoveButton.disable();
			}

		},

		enableUp : function() {

			this.bCanUp = true;

			if(this.bDisabledByOuter) {
				return;
			}

			if(this.oUpButton) {
				this.oUpButton.enable();
			}

		},

		disableUp : function() {

			this.bCanUp = false;

			if(this.oUpButton) {
				this.oUpButton.disable();
			}

		},

		enableDown : function() {

			this.bCanDown = true;

			if(this.bDisabledByOuter) {
				return;
			}

			if(this.oDownButton) {
				this.oDownButton.enable();
			}

		},

		disableDown : function() {

			this.bCanDown = false;

			if(this.oDownButton) {
				this.oDownButton.disable();
			}

		},

		updateState : function(
			bEnableAdd,
			bEnableRemove,
			bEnableUp,
			bEnableDown
			) {

			if(bEnableAdd) {
				this.enableAdd();
			}
			else {
				this.disableAdd();
			}

			if(bEnableRemove) {
				this.enableRemove();
			}
			else {
				this.disableRemove();
			}

			if(bEnableUp) {
				this.enableUp();
			}
			else {
				this.disableUp();
			}

			if(bEnableDown) {
				this.enableDown();
			}
			else {
				this.disableDown();
			}

		},

		init : function() {

			if(this.oAddButton) {
				this.oAddButton.init();
			}

			if(this.oRemoveButton) {
				this.oRemoveButton.init();
			}

			if(this.oUpButton) {
				this.oUpButton.init();
			}

			if(this.oDownButton) {
				this.oDownButton.init();
			}

		},

		addId : function(iIndex) {

			if(this.oAddButton) {
				this.oAddButton.addId(iIndex);
			}

			if(this.oRemoveButton) {
				this.oRemoveButton.addId(iIndex);
			}

			if(this.oUpButton) {
				this.oUpButton.addId(iIndex);
			}

			if(this.oDownButton) {
				this.oDownButton.addId(iIndex);
			}

		},

		destruct : function() {

			if(this.oAddButton) {
				this.oAddButton.destruct();
			}

			if(this.oRemoveButton) {
				this.oRemoveButton.destruct();
			}

			if(this.oUpButton) {
				this.oUpButton.destruct();
			}

			if(this.oDownButton) {
				this.oDownButton.destruct();
			}

		}

	}
	);
ZForms.Widget.Container.Sheet = ZForms.Widget.Container.inheritTo(
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

			this.oLegendButton = null;
			this.oPrevButton = null;
			this.oNextButton = null;

			if(this.oOptions.oElementLegend) {
				this.addLegendButton(
					new ZForms.Widget.Button(
						this.oOptions.oElementLegend,
						null,
						{
							bTemplate : this.oOptions.bTemplate
						}
					)
				);
			}

			if(this.oOptions.oElementPrev) {
				this.addPrevButton(
					new ZForms.Widget.Button(
						this.oOptions.oElementPrev,
						null,
						{
							bTemplate : this.oOptions.bTemplate
						}
					)
				);
			}

			if(this.oOptions.oElementNext) {
				this.addNextButton(
					new ZForms.Widget.Button(
						this.oOptions.oElementNext,
						null,
						{
							bTemplate : this.oOptions.bTemplate
						}
					)
				);
			}

			this.bSelected = Common.Class.match(this.oClassElement, this.__self.CLASS_NAME_SELECTED);

		},

		addLegendButton : function(oButton) {

			this.oLegendButton = oButton;

			this.addChild(oButton);

			var oThis = this;

			oButton.setHandler(
				function() {

					oThis.oParent.select(oThis);

					return false;

				}

			);

		},

		addPrevButton : function(oButton) {

			this.oPrevButton = oButton;

			this.addChild(oButton);

			var oThis = this;

			oButton.setHandler(
				function() {

					oThis.oParent.prev(oThis);

					return false;

				}
			);

		},

		addNextButton : function(oButton) {

			this.oNextButton = oButton;

			this.addChild(oButton);

			var oThis = this;

			oButton.setHandler(
				function() {

					oThis.oParent.next(oThis);
					return false;

				}
			);

		},

		setParent : function(oParent) {

			this.__base(oParent);

			if(this.isSelected()) {
				this.oParent.select(this);
			}

		},

		isSelected : function() {

			return this.bSelected;

		},

		select : function() {

			this.bSelected = true;

			this.addClass(this.__self.CLASS_NAME_SELECTED);

			if(this.oLegendButton) {
				this.oLegendButton.addClass(this.__self.CLASS_NAME_SELECTED);
			}

		},

		unselect : function() {

			this.bSelected = false;

			this.removeClass(this.__self.CLASS_NAME_SELECTED);

			if(this.oLegendButton) {
				this.oLegendButton.removeClass(this.__self.CLASS_NAME_SELECTED);
			}

		},

		destruct : function() {

			if(this.oLegendButton) {
				this.oLegendButton.destruct();
			}

			if(this.oPrevButton) {
				this.oPrevButton.destruct();
			}

			if(this.oNextButton) {
				this.oNextButton.destruct();
			}

			this.__base();

		}

	}
	);
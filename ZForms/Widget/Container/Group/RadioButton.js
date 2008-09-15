ZForms.Widget.Container.Group.RadioButton = ZForms.Widget.Container.Group.inheritTo(
	{
	
		setValue : function(oValue) {

			for(var i = 0; i < this.aChildren.length; i++) {
				if(oValue.isEqual(this.aChildren[i].getValue())) {
					this.aChildren[i].check();
				}
			}

			this.__base(oValue);

		},

		setValueFromElement : function() {

			this.oValue.reset();

			for(var i = 0; i < this.aChildren.length; i++) {
				if(this.aChildren[i].isChecked() && this.aChildren[i].isEnabled()) {

					this.oValue.set(this.aChildren[i].getValue().get());
					break;

				}
			}

			this.__base();

		},

		addChild : function(oChild) {

			if(!this.__base(oChild)) {
				return;
			}

			if(oChild.isChecked()) {

				this.oValue.set(oChild.getValue().get());
				this.oInitialValue.set(oChild.getValue().get());

			}

			return oChild;

		},

		enableOptionsByValue : function(
			aPatternGroups,
			bJoin
			) {

			var
				bRecheckChildren = false,
				iFirstEnabledChildIndex = -1
				;

			for(var i = 0, bMatched, oChild, bEnable; i < this.aChildren.length; i++) {

				oChild = this.aChildren[i];

				bEnable = false;

				for(var j = 0; j < aPatternGroups.length; j++) {

					bMatched = false;

					for(var k = 0; k < aPatternGroups[j].length && !bMatched; k++) {
						bMatched = oChild.getValue().match(aPatternGroups[j][k])? true : false;
					}

					if(bMatched) {

						if(iFirstEnabledChildIndex < 0) {
							iFirstEnabledChildIndex = i;
						}

						if(bJoin || j == 0) {
							bEnable	= true;
						}

					}
					else if(!bJoin) {
						bEnable = false;
					}

				}

				if(bEnable && this.isEnabled()) {
					oChild.enable();
				}
				else if(oChild.isEnabled()) {
					oChild.disable();
				}

				if(!oChild.isEnabled() && oChild.isChecked()) {
					bRecheckChildren = true;
				}

			}

			if(bRecheckChildren && iFirstEnabledChildIndex > -1) {

				this.oValue.set(this.aChildren[iFirstEnabledChildIndex].getValue());
				this.aChildren[iFirstEnabledChildIndex].check();

			}

			this.processEvents(true);

		}

	}		
	);
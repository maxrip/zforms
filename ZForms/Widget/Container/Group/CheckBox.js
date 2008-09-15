ZForms.Widget.Container.Group.CheckBox = ZForms.Widget.Container.Group.inheritTo(
	{	

		createValue : function(mValue) {

			return new ZForms.Value.Multiple(mValue);

		},

		setValue : function(oValue) {

			for(var i = 0, aValues = oValue.get(); i < this.aChildren.length; i++) {

				if(aValues.contains(this.aChildren[i].getValue().get())) {
					this.aChildren[i].check();
				}
				else {
					this.aChildren[i].uncheck();
				}

			}

			this.__base(oValue);

		},

		setValueFromElement : function() {

			this.oValue.reset();

			for(var i = 0; i < this.aChildren.length; i++) {
				if(this.aChildren[i].isChecked() && this.aChildren[i].isEnabled()) {
					this.oValue.add(this.aChildren[i].getValue().get());
				}
			}

			this.__base();

		},

		addChild : function(oChild) {

			if(!this.__base(oChild)) {
				return;
			}
			
			if(oChild.isChecked()) {

				this.oValue.add(oChild.getValue().get());
				this.oInitialValue.add(oChild.getValue().get());

			}

			return oChild;

		},

		enableOptionsByValue : function(
			aPatternGroups,
			bJoin,
			bCheckAction
			) {

			for(var i = 0, bMatched, oChild, bEnable; i < this.aChildren.length; i++) {

				oChild = this.aChildren[i];

				bEnable = false;

				for(var j = 0; j < aPatternGroups.length; j++) {

					bMatched = false;

					for(var k = 0; k < aPatternGroups[j].length && !bMatched; k++) {
						bMatched = oChild.getValue().match(aPatternGroups[j][k])? true : false;
					}

					if(bMatched) {
						if(bJoin || j == 0) {
							bEnable	= true;
						}
					}
					else if(!bJoin) {
						bEnable = false;
					}

				}

				if(bEnable) {

					if(bCheckAction) {
						oChild.check();
					}
					else if(this.isEnabled()) {
						oChild.enable();
					}

				}
				else {

					if(bCheckAction) {
						oChild.uncheck();
					}
					else {
						oChild.disable();
					}

				}

			}

			this.processEvents(true);

		}

	}	
	);
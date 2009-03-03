ZForms.Dependence.Required = ZForms.Dependence.inheritTo(
	{

		__constructor : function(
			oFrom,
			rPattern,
			iLogic,
			bInverse,
			iMin
			) {

			this.__base(
				this.__self.TYPE_REQUIRED,
				oFrom,
				rPattern,
				iLogic,
				bInverse
				);

			this.iMin = iMin || 1;

			if(!(this.getFrom() instanceof ZForms.Widget.Container)) {
				this.iMin = 1;
			}

		},

		getMin : function() {

			return this.iMin;

		},

		check : function() {

			if(this.oFrom.isTemplate()) {
				return true;
			}

			var
				iCountMatched = 0,
				bHasRequiredChild = false,
				bHasEnabledChild = true,
				bResult = false
				;

			if(this.oFrom instanceof ZForms.Widget.Container.Group) {
				for(var i = 0; i < this.oFrom.aChildren.length; i++) {
					if(this.oFrom.aChildren[i].isChecked()) {
						iCountMatched++;
					}
				}
			}
			else if(this.oFrom instanceof ZForms.Widget.Container &&
				!(this.oFrom instanceof ZForms.Widget.Container.Date)
				) {

				bHasEnabledChild = false;

				for(var i = 0; i < this.oFrom.aChildren.length; i++) {

					if(this.oFrom.aChildren[i].isEnabled()) {
						bHasEnabledChild = true;
					}
					else {
						continue;
					}

					if(this.oFrom.aChildren[i] instanceof ZForms.Widget.Container &&
						!(this.oFrom.aChildren[i] instanceof ZForms.Widget.Container.Date)) {

						if(this.oFrom.aChildren[i].isRequired()) {
							bHasRequiredChild = true;
						}
						else {

							var iCountUnrequiredChildren = 0;

							if(this.oFrom.aChildren[i] instanceof ZForms.Widget.Container.Group) {

								for(var j = 0; j < this.oFrom.aChildren[i].aChildren.length; j++) {
									if(this.oFrom.aChildren[i].aChildren[j].isChecked()) {
										iCountUnrequiredChildren++;
									}
								}

							}
							else {
								iCountUnrequiredChildren = this.oFrom.aChildren[i].getCountChildrenByPattern(this.rPattern);
							}

							if(this.oFrom.aChildren[i] instanceof ZForms.Widget.Container.Multiplicator) {
								iCountMatched += iCountUnrequiredChildren;
							}
							else if (iCountUnrequiredChildren > 0) {
								iCountMatched++;
							}

						}

					}
					else if(this.oFrom.aChildren[i].isRequired()) {
						bHasRequiredChild = true;
					}
					else if(this.oFrom.aChildren[i].getValue().match(/\S+/)) {
						iCountMatched++;
					}

				}

			}
			else if(this.oFrom.getValue().match(this.rPattern)) {
				iCountMatched++;
			}

			bResult = !bHasRequiredChild && (iCountMatched >= this.iMin || !bHasEnabledChild);

			return this.isInverse()? !bResult : bResult;

		},

		clone : function(oFrom) {

			return new this.__self(
				oFrom,
				this.getPattern(),
				this.getLogic(),
				this.isInverse(),
				this.getMin()
				);

		}

	}
	);
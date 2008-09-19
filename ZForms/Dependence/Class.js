ZForms.Dependence.Class = ZForms.Dependence.inheritTo(
	{
	
		__constructor : function(
			oFrom,
			aPatternToClasses,
			iLogic
			) {
		
			this.__base(
				this.__self.TYPE_CLASS,
				oFrom,
				null,
				iLogic,
				false
				);
		
			this.aPatternToClasses = aPatternToClasses;
			this.aResult = [];

		},

		getPatternToClasses : function() {

			return this.aPatternToClasses;

		},

		check : function() {

			if(this.oFrom.isTemplate()) {
				return true;
			}

			this.aResult = [];

			var mValue = this.oFrom.getValue();

			for(var i = 0; i < this.aPatternToClasses.length; i++) {
				this.aResult.push({
					sClassName : this.aPatternToClasses[i].sClassName,
					bMatched   : mValue.match(this.aPatternToClasses[i].rPattern)
					});
			}

			return this.aResult.length > 0;

		},

		clone : function(oFrom) {

			return new this.__self(
				oFrom,
				this.getPatternToClasses(),
				this.getLogic()
				);

		},

		getResult : function() {

			return this.aResult;

		}

	}
	);



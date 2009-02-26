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

			var
				mValue = this.oFrom.getValue(),
				i = 0,
				oPatternToClass
				;

			while(oPatternToClass = this.aPatternToClasses[i++]) {
				this.aResult.push(
					{
						sClassName : oPatternToClass.sClassName,
						bMatched   : mValue.match(oPatternToClass.rPattern)?
							 !oPatternToClass.bInverse :
							 oPatternToClass.bInverse
					}
					);
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



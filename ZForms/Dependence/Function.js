	ZForms.Dependence.Function = ZForms.Dependence.inheritTo(
	{

		__constructor : function(
			iType,
			oFrom,
			fFunction,
			iLogic,
			bInverse
			) {

			this.__base(
				iType,
				oFrom,
				null,
				iLogic,
				bInverse
				);

			this.fFunction = fFunction;
			this.mResult = null;

		},

		getFunction : function() {

			return this.fFunction;

		},

		check : function() {

			if(this.oFrom.isTemplate()) {
				return true;
			}

			this.mResult = null;

			var bMatched = this.fFunction(this.oFrom, this);

			return this.isInverse()? !bMatched : bMatched;

		},

		setResult : function(mResult) {

			this.mResult = mResult;

		},

		getResult : function() {

			return this.mResult;

		},

		clone : function(oFrom) {

			eval('var fClonedFunction = ' + this.getFunction().toString());

			return new this.__self(
				this.getType(),
				oFrom,
				fClonedFunction,
				this.getLogic(),
				this.isInverse()
				);

		}

	}
	);
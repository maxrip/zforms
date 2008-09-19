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
			this.aResult = [];
			
		},

		getFunction : function() {
	
			return this.fFunction;
	
		},

		check : function() {

			if(this.oFrom.isTemplate()) {
				return true;
			}
			
			this.aResult = [];
	
			var bMatched = this.fFunction(this.oFrom, this.aResult);		
		
			return this.isInverse()? !bMatched : bMatched;

		},
				
		getResult : function() {

			return this.aResult;

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
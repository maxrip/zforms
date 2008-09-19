ZForms.Dependence.Options = ZForms.Dependence.inheritTo(
	{
	
		__constructor : function(
			iType,
			oFrom,
			aPatterns,
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
				
			this.aPatterns = aPatterns;
			this.aResult = [];

		},
	
		getPatterns : function() {
	
			return this.aPatterns;
	
		},

		check : function() {
	
			if(this.oFrom.isTemplate()) {
				return true;
			}

			this.aResult = [];

			var
				mValue = this.oFrom.getValue(),
				bMatched = false
				;

			for(var i = 0; i < this.aPatterns.length; i++) {			
	
				bMatched = mValue.match(this.aPatterns[i].rSource);	
		
				if(this.bInverse? !bMatched : bMatched) {
					this.aResult.push(this.aPatterns[i].rDestination);
				}
	
			}
	
			return true;
			
		},

		getResult : function() {

			return this.aResult;

		}
		
	}
	);
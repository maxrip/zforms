ZForms.Dependence.Valid = ZForms.Dependence.inheritTo(
	{
	
		__constructor :	function(
			oFrom,
			sPattern,
			iLogic,
			bInverse
			) {
	
			this.__base(
				this.__self.TYPE_VALID,
				oFrom,
				sPattern,
				iLogic,
				bInverse
				);
				
		},	

		check : function() {

			if(this.oFrom.isTemplate() || this.oFrom.getValue().isEmpty()) {
				return true;
			}
	
			return this.__base();	
			
		},

		clone : function(oFrom) {
		
			return new this.__self(		
				oFrom,
				this.getPattern(),
				this.getLogic(),
				this.isInverse()
				);
				
		}
		
	}
	);
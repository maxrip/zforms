ZForms.Dependence.Valid = ZForms.Dependence.inheritTo(
	{

		__constructor :	function(
			oFrom,
			sPattern,
			iLogic,
			bInverse,
            sClassName
			) {

			this.__base(
				this.__self.TYPE_VALID,
				oFrom,
				sPattern,
				iLogic,
				bInverse
				);

			this.bCheckResult = false;
			this.sClassName = sClassName;

		},

		check : function() {

			if(this.oFrom.isTemplate() || this.oFrom.getValue().isEmpty()) {
				return true;
			}

			this.bCheckResult = this.__base();

			return this.bCheckResult;

		},

		getResult : function() {

			if(!this.sClassName) {
				return;
			}

			return {
				bAdd       : !this.bCheckResult,
				sClassName : this.sClassName
				};

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
ZForms.Dependence.Valid = ZForms.Dependence.inheritTo(
	{

		__constructor :	function(
			oFrom,
			rPattern,
			iLogic,
			bInverse,
            sClassName,
			bCheckForEmpty
			) {

			this.__base(
				this.__self.TYPE_VALID,
				oFrom,
				rPattern,
				iLogic,
				bInverse
				);

			this.bCheckResult = false;
			this.sClassName = sClassName;
			this.bCheckForEmpty = bCheckForEmpty;

		},

		check : function() {

			if(this.oFrom.isTemplate() || (!this.bCheckForEmpty && this.oFrom.getValue().isEmpty())) {
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
				this.isInverse(),
				this.sClassName,
				this.bCheckForEmpty
				);

		}

	}
	);
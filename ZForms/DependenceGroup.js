ZForms.DependenceGroup = Abstract.inheritTo(
	{

		__constructor : function(iType) {

			this.iType = iType;
			this.aDependencies = [];

		},

		getType : function() {

			return this.iType;

		},

		addDependence : function(oDependence) {

			this.aDependencies.push(oDependence);

		},

		removeDependence : function(oDependence) {

			this.aDependencies.remove(oDependence);

		},

		getDependencies : function() {

			return this.aDependencies;

		},

		check : function() {

			var
				bResult = this.aDependencies.length == 0,
				bDependenceCheckResult = false
				;

			for(var i = 0, bStopUpdate = false; i < this.aDependencies.length; i++) {

				bDependenceCheckResult = this.aDependencies[i].check();

				if(bStopUpdate) {
					continue;
				}

				if(bDependenceCheckResult &&
					this.aDependencies[i].getLogic() == ZForms.Dependence.LOGIC_OR) {

					bResult = true;

					if(!(this.getType() == ZForms.Dependence.TYPE_CLASS || this.getType() == ZForms.Dependence.TYPE_OPTIONS)) {
						break;
					}

				}
				else if(!bDependenceCheckResult &&
					this.aDependencies[i].getLogic() == ZForms.Dependence.LOGIC_AND) {

					bResult = false;
					bStopUpdate = true;

					if(this.getType() != ZForms.Dependence.TYPE_VALID) {
						break;
					}

				}
				else {
					bResult = bDependenceCheckResult;
				}

			}

			return bResult;

		},

		getResult : function() {

			for(var i = 0, aResult = [], aDependencyResult; i < this.aDependencies.length; i++) {
				aResult.push(this.aDependencies[i].getResult());
				/*aResult.push(aDependencyResult.length == 0 && this.getType() == Dependence.TYPE_OPTIONS?
					[/^.*$/] :
					aDependencyResult
					);*/
			}

			return aResult;

		}

	}
	);
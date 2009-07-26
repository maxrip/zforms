ZForms.DependenceProcessor = Abstract.inheritTo(
	{

		__constructor : function(oWidget) {

			this.oWidget = oWidget;
			this.aDependenceGroups = [];

			this.aCheckingOrder = [
				ZForms.Dependence.TYPE_ENABLED,
				ZForms.Dependence.TYPE_VALID,
				ZForms.Dependence.TYPE_REQUIRED,
				ZForms.Dependence.TYPE_OPTIONS,
				ZForms.Dependence.TYPE_CHECK,
				ZForms.Dependence.TYPE_CLASS
				];

		},

		addDependence : function(oDependence) {

			if(!this.hasDependenciesByType(oDependence.getType())) {
				this.aDependenceGroups[oDependence.getType()] = new ZForms.DependenceGroup(oDependence.getType());
			}

			this.aDependenceGroups[oDependence.getType()].addDependence(oDependence);

		},

		removeDependence : function(oDependence) {

			this.aDependenceGroups[oDependence.getType()].removeDependence(oDependence);

		},

		getDependencies : function() {

			var aResult = [];

			for(var i = 0; i < this.aCheckingOrder.length; i++) {

				if(!this.hasDependenciesByType(this.aCheckingOrder[i])) {
					continue;
				}

				aResult = aResult.concat(this.aDependenceGroups[this.aCheckingOrder[i]].getDependencies());

			}

			return aResult;

		},

		hasDependenciesByType : function(iType) {

			return this.aDependenceGroups[iType] &&
				this.aDependenceGroups[iType].getDependencies().length > 0
				;

		},

		process : function() {

			if(this.oWidget.isTemplate()) {
				return;
			}

			for(var i = 0; i < this.aCheckingOrder.length; i++) {
				this.dispatchProcessDependencies(this.aCheckingOrder[i]);
			}

		},

		dispatchProcessDependencies : function(sType) {

			if(!this.hasDependenciesByType(sType)) {
				return;
			}

			switch(sType) {

				case ZForms.Dependence.TYPE_ENABLED:
					this.processEnableDependencies();
				break;

				case ZForms.Dependence.TYPE_VALID:
					this.processValidDependencies();
				break;

				case ZForms.Dependence.TYPE_REQUIRED:
					this.processRequiredDependencies();
				break;

				case ZForms.Dependence.TYPE_OPTIONS:
				case ZForms.Dependence.TYPE_CHECK:
					this.processOptionsDependencies(sType);
				break;

				case ZForms.Dependence.TYPE_CLASS:
					this.processClassDependencies();
				break;

				default:
				break;

			}

		},

		processEnableDependencies : function() {

			var
				bCheckResult = this.aDependenceGroups[ZForms.Dependence.TYPE_ENABLED].check(),
				aResult = this.aDependenceGroups[ZForms.Dependence.TYPE_ENABLED].getResult()
				;

			if(bCheckResult) {
				this.oWidget.enable();
			}
			else {
				this.oWidget.disable();
			}

			if(!this.oWidget.isInited()) {
				return;
			}

			var
				oResult,
				i = 0
				;
			while(oResult = aResult[i++]) {
				if(oResult.bFocusOnEnable) {
					return this.oWidget.focus();
				}
			}

		},

		processValidDependencies : function() {

			var
				bCheckResult = this.aDependenceGroups[ZForms.Dependence.TYPE_VALID].check(),
				aClasses = this.aDependenceGroups[ZForms.Dependence.TYPE_VALID].getResult(),
				i = 0
				;

			if(bCheckResult) {
				this.oWidget.setValid();
			}
			else {
				this.oWidget.setInvalid();
			}

			while(i < aClasses.length) {

				if(aClasses[i] && aClasses[i].sClassName) {
					this.oWidget[(aClasses[i].bAdd && !bCheckResult? 'add' : 'remove') +'Class'](aClasses[i].sClassName);
				}

				++i;

			}

		},

		processRequiredDependencies : function() {

			if(this.aDependenceGroups[ZForms.Dependence.TYPE_REQUIRED].check() && this.oWidget.isValid()) {
				this.oWidget.unsetRequired();
			}
			else {
				this.oWidget.setRequired();
			}

		},

		processOptionsDependencies : function(sType) {

			var
				bCheckResult = this.aDependenceGroups[sType].check(),
				aPatternGroups = this.aDependenceGroups[sType].getResult()
				;

			this.oWidget.enableOptionsByValue(
				aPatternGroups,
				this.aDependenceGroups[sType].getDependencies()[0].getLogic() == ZForms.Dependence.LOGIC_OR,
				sType == ZForms.Dependence.TYPE_CHECK
				);

		},

		processClassDependencies : function() {

			var
				bCheckResult = this.aDependenceGroups[ZForms.Dependence.TYPE_CLASS].check(),
				aClassesGroups = this.aDependenceGroups[ZForms.Dependence.TYPE_CLASS].getResult(),
				bIntersect = this.aDependenceGroups[ZForms.Dependence.TYPE_CLASS].getDependencies()[0].getLogic() == ZForms.Dependence.LOGIC_AND,
				aClasses = []
				;

			for(var i = 0; i < aClassesGroups.length; i++) {
				aClasses = this.joinClassGroup(
					aClasses,
					aClassesGroups[i],
					bIntersect
					);
			}

			if(bCheckResult &&
				aClasses.length == 0
				) {
				return;
			}

			for(var i = 0; i < aClasses.length; i++) {

				if(aClasses[i].bMatched) {
					this.oWidget.addClass(aClasses[i].sClassName);
				}
				else {
					this.oWidget.removeClass(aClasses[i].sClassName);
				}

			}

		},

		joinClassGroup : function(
			aClassesGroup1,
			aClassesGroup2,
			bIntersect
			) {

			if(aClassesGroup1.length == 0) {
				return aClassesGroup2;
			}

			for(var i = 0, iLength = aClassesGroup1.length; i < iLength; i++) {

				for(var j = 0; j < aClassesGroup2.length; j++) {
					if(aClassesGroup1[i].sClassName == aClassesGroup2[j].sClassName) {
						if((!bIntersect && aClassesGroup2[j].bMatched) ||
							(bIntersect && !aClassesGroup2[j].bMatched)
							) {
							aClassesGroup1[i] = aClassesGroup2[j];
						}
						else {
							aClassesGroup2[j] = aClassesGroup1[i];
						}
					}
					else if(!aClassesGroup1.contains(aClassesGroup2[j])) {
						aClassesGroup1[aClassesGroup1.length] = aClassesGroup2[j];
					}
				}

			}

			return aClassesGroup1;

		}

	}
	);
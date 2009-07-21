ZForms.Widget.Container.Multiplicator = ZForms.Widget.Container.inheritTo(
	{

		__constructor : function(
			oElement,
			oClassElement,
			oOptions
			) {

			this.oTemplate = null;
			this.sButtonAddId = oOptions? oOptions.sButtonAddId : null;
			this.sButtonRemoveId = oOptions? oOptions.sButtonRemoveId : null;
			this.sButtonUpId = oOptions? oOptions.sButtonUpId : null;
			this.sButtonDownId = oOptions? oOptions.sButtonDownId : null;
			this.sInitialChildrenHash = null;
			this.sLastProcessedChildrenHash = null;

			this.__base(
				oElement || document.createElement('div'),
				oClassElement,
				oOptions
				);

		},

		getDefaultOptions : function() {

			return Common.Object.extend(
				this.__base(),
				{
					iMin            : 1,
					iMax            : 10,
					bNameHasPostfix : false
				},
				true
				);

		},

		addChild : function(
			oChild,
			iIndex
			) {

			var
				iPostfix = iIndex > -1? iIndex : this.aChildren.length,
				oMultiplier = new ZForms.Multiplier(this, oChild),
				sPostfix = (iPostfix > 0? '_' + iPostfix : '')
				;

			if(this.sButtonAddId) {
				oMultiplier.addAddButton(ZForms.createButton(document.getElementById(this.sButtonAddId + sPostfix)));
			}

			if(this.sButtonRemoveId) {
				oMultiplier.addRemoveButton(ZForms.createButton(document.getElementById(this.sButtonRemoveId + sPostfix)));
			}

			if(this.sButtonUpId) {
				oMultiplier.addUpButton(ZForms.createButton(document.getElementById(this.sButtonUpId + sPostfix)));
			}

			if(this.sButtonDownId) {
				oMultiplier.addDownButton(ZForms.createButton(document.getElementById(this.sButtonDownId + sPostfix)));
			}

			oChild.setMultiplier(oMultiplier);

			this.updateChildIndex(oChild, 0, iPostfix);

			return this.__base(
				oChild,
				iIndex
				);

		},

		addTemplate : function(oTemplate) {

			this.oTemplate = oTemplate;

			oTemplate.setMultiplier(new ZForms.Multiplier(this, oTemplate));

			if(this.oForm) {
				oTemplate.setForm(this.oForm);
			}

			return oTemplate;

		},

		normalizeTemplateAttributes : function(oTemplate) {

			var aScriptNodes = oTemplate.oClassElement.getElementsByTagName('script');

			while(aScriptNodes.length > 0) {
				aScriptNodes[0].parentNode.removeChild(aScriptNodes[0]);
			}

			this.replacePostfixAtElement(oTemplate.oClassElement, this.oOptions.iMax + 1);

			oTemplate.setId(oTemplate.oElement.id);

		},

		calculateCurrentChildrenHash : function() {

			var sResult = '';

			for(var i = 0, iLength = this.aChildren.length; i < iLength; i++) {
				sResult += Common.Dom.getUniqueId(this.aChildren[i].oElement);
			}

			return sResult;

		},

		processChildrenHashChanged : function() {

			var sCurrentChildrenHash = this.calculateCurrentChildrenHash();

			if(this.sInitialChildrenHash == sCurrentChildrenHash) {
				if(this.sLastProcessedChildrenHash != this.sInitialChildrenHash) {

					this.oForm.decreaseChangedCounter();
					this.oForm.updateSubmit();

				}
			}
			else if(this.sLastProcessedChildrenHash == this.sInitialChildrenHash) {

				this.oForm.increaseChangedCounter();
				this.oForm.updateSubmit();

			}

			this.sLastProcessedChildrenHash = sCurrentChildrenHash;

		},

		init : function() {

			this.__base();

			if(!this.oTemplate) {
				ZForms.throwException('template not found');
			}

			for(var i = 0; i < this.aChildren.length; i++) {
				this.aChildren[i].addId(i);
			}

			this.oTemplate.hide();
			this.oTemplate.disable();
			this.oTemplate.addId(this.oOptions.iMax + 1);

			this.normalizeTemplateAttributes(this.oTemplate);

			this.updateMultipliers();

			this.sInitialChildrenHash = this.calculateCurrentChildrenHash();
			this.sLastProcessedChildrenHash = this.sInitialChildrenHash;

		},

		updateMultipliers : function() {

			for(var i = 0; i < this.aChildren.length; i++) {
				this.aChildren[i].getMultiplier().updateState(
					this.aChildren.length < this.oOptions.iMax,
					this.aChildren.length > this.oOptions.iMin,
					i > 0,
					i < this.aChildren.length - 1
					);
			}

		},

		add : function(oChild) {

			var
				iChildIndex = this.aChildren.indexOf(oChild) + 1,
				oNewElement = this.oTemplate.oClassElement.cloneNode(true)
				;

			this.increaseChildrenPostfix(iChildIndex);

			this.removePostfixFromElement(oNewElement);
			this.addPostfixToElement(oNewElement, iChildIndex);

			if(oChild.oClassElement.nextSibling) {
				oChild.oClassElement.parentNode.insertBefore(oNewElement, oChild.oClassElement.nextSibling);
			}
			else {
				oChild.oClassElement.parentNode.appendChild(oNewElement);
			}

			var oNewChild = this.oTemplate.clone(
				document.getElementById(this.oTemplate.oElement.id.match(this.__self.REG_EXP_REPLACE)[1] + '_' + iChildIndex),
				document.getElementById(this.oTemplate.oClassElement.id.match(this.__self.REG_EXP_REPLACE)[1]  + '_' + iChildIndex),
				iChildIndex
				);

			var oMultiplier = this.oTemplate.getMultiplier();

			if(!this.sButtonAddId && oMultiplier.oAddButton) {
				this.sButtonAddId = oMultiplier.oAddButton.oElement.id.match(this.__self.REG_EXP_REPLACE)[1];
			}

			if(!this.sButtonRemoveId && oMultiplier.oRemoveButton) {
				this.sButtonRemoveId = oMultiplier.oRemoveButton.oElement.id.match(this.__self.REG_EXP_REPLACE)[1];
			}

			if(!this.sButtonUpId && oMultiplier.oUpButton) {
				this.sButtonUpId = oMultiplier.oUpButton.oElement.id.match(this.__self.REG_EXP_REPLACE)[1];
			}

			if(!this.sButtonDownId && oMultiplier.oDownButton) {
				this.sButtonDownId = oMultiplier.oDownButton.oElement.id.match(this.__self.REG_EXP_REPLACE)[1];
			}

			this.addChild(oNewChild, iChildIndex);

			oNewChild.disable();
			oNewChild.enable();
			oNewChild.show();

			this.updateMultipliers();

			this.addTemplateDependencies(this.oTemplate, oNewChild, oNewChild);

			oNewChild.afterClone();

			this.repaintFix();

			this.processChildrenHashChanged();

		},

		addTemplateDependencies : function(
			oCurrentTemplate,
			oCurrentWidget,
			oClonedWidget
			) {

			this.addDependenciesFrom(oCurrentTemplate, oCurrentWidget, oClonedWidget);
			this.addDependenciesTo(oCurrentTemplate, oCurrentWidget, oClonedWidget);

			if(oCurrentTemplate instanceof ZForms.Widget.Container) {
				for(var i = 0; i < oCurrentTemplate.aChildren.length; i++) {
					this.addTemplateDependencies(oCurrentTemplate.aChildren[i], oCurrentWidget.aChildren[i], oClonedWidget);
				}
			}

		},

		addDependenciesFrom : function(
			oCurrentTemplate,
			oCurrentWidget,
			oClonedWidget
			) {

			for(var i = 0, aDependencies = oCurrentTemplate.getDependencies(), oFrom, oDependenceCloned; i < aDependencies.length; i++) {

				oFrom = this.findCorrespondingWidgetByTemplate(aDependencies[i].getFrom(), this.oTemplate, oClonedWidget) ||
					aDependencies[i].getFrom()
					;

				oDependenceCloned = aDependencies[i].clone(oFrom);

				// change mArgument if dependence is compare dependence

				if(oDependenceCloned instanceof ZForms.Dependence.Function/* && aDependencies[i].getFunction().mArgument instanceof ZForms.Widget*/) {

					oDependenceCloned.getFunction().mArgument =
						this.findCorrespondingWidgetByTemplate(aDependencies[i].getFunction().mArgument, this.oTemplate, oClonedWidget) ||
						aDependencies[i].getFunction().mArgument
						;

					oDependenceCloned.getFunction().oWidget =
						this.findCorrespondingWidgetByTemplate(aDependencies[i].getFunction().oWidget, this.oTemplate, oClonedWidget) ||
						aDependencies[i].getFunction().oWidget
						;

					oDependenceCloned.getFunction().iType = aDependencies[i].getFunction().iType;
					oDependenceCloned.getFunction().sFunctionName = aDependencies[i].getFunction().sFunctionName;
					oDependenceCloned.getFunction().oOptions = aDependencies[i].getFunction().oOptions;

				}

				oCurrentWidget.addDependence(oDependenceCloned);

				oFrom.processEvents(true, true);

			}

		},

		addDependenciesTo : function(
			oCurrentTemplate,
			oCurrentWidget,
			oClonedWidget
			) {

			for(var i = 0, aDependencies; i < oCurrentTemplate.aObservers.length; i++) {

				if(this.findCorrespondingWidgetByTemplate(oCurrentTemplate.aObservers[i], this.oTemplate, oClonedWidget)) {
					continue;
				}

				aDependencies = oCurrentTemplate.aObservers[i].getDependencies();

				for(var j = 0; j < aDependencies.length; j++) {
					if(aDependencies[j].getFrom() == oCurrentTemplate) {
						oCurrentTemplate.aObservers[i].addDependence(aDependencies[j].clone(oCurrentWidget));
					}
				}

			}

		},

		findCorrespondingWidgetByTemplate : function(
			oTemplateForFind,
			oCurrentTemplate,
			oCurrentWidget
			) {

			if(oCurrentTemplate == oTemplateForFind) {
				return oCurrentWidget;
			}

			if(oCurrentTemplate instanceof ZForms.Widget.Container) {

				for(var i = 0, oFoundedWidget; i < oCurrentTemplate.aChildren.length; i++) {

					oFoundedWidget = this.findCorrespondingWidgetByTemplate(oTemplateForFind, oCurrentTemplate.aChildren[i], oCurrentWidget.aChildren[i]);

					if(oFoundedWidget) {
						return oFoundedWidget;
					}

				}

			}

		},

		remove : function(oChild) {

			var iChildIndex = this.aChildren.indexOf(oChild);

			oChild.oClassElement.parentNode.removeChild(oChild.oClassElement);

			this.decreaseChildrenPostfix(iChildIndex + 1);

			this.removeChild(oChild);

			this.processEvents(true);

			this.updateMultipliers();

			this.repaintFix();

			this.processChildrenHashChanged();

		},

		up : function(oChild) {

			var iChildIndex = this.aChildren.indexOf(oChild);

			this.aChildren[iChildIndex - 1].oClassElement.parentNode.insertBefore(oChild.oClassElement.parentNode.removeChild(oChild.oClassElement), this.aChildren[iChildIndex - 1].oClassElement);

			this.aChildren.remove(oChild);
			this.aChildren.splice(iChildIndex - 1, 0, oChild);

			if(iChildIndex - 1 > 0) {
				this.replacePostfixAtElement(this.aChildren[iChildIndex].oClassElement, iChildIndex);
			}
			else {
				this.addPostfixToElement(this.aChildren[iChildIndex].oClassElement, iChildIndex);
			}

			this.updateChildIndex(this.aChildren[iChildIndex - 1], iChildIndex, iChildIndex - 1);
			this.replacePostfixAtElement(this.aChildren[iChildIndex - 1].oClassElement, iChildIndex - 1);
			this.aChildren[iChildIndex - 1].updateElements(iChildIndex - 1);

			this.updateChildIndex(this.aChildren[iChildIndex], iChildIndex - 1, iChildIndex);

			this.aChildren[iChildIndex].updateElements(iChildIndex);

			this.updateMultipliers();

			this.repaintFix();

			this.processChildrenHashChanged();

		},

		down : function(oChild) {

			var iChildIndex = this.aChildren.indexOf(oChild);

			if(this.aChildren[iChildIndex + 2]) {
				this.aChildren[iChildIndex + 2].oClassElement.parentNode.insertBefore(oChild.oClassElement.parentNode.removeChild(oChild.oClassElement), this.aChildren[iChildIndex + 2].oClassElement);
			}
			else {
				this.aChildren[iChildIndex + 1].oClassElement.parentNode.insertBefore(oChild.oClassElement.parentNode.removeChild(oChild.oClassElement), this.oTemplate.oClassElement);
			}

			this.aChildren.remove(oChild);
			this.aChildren.splice(iChildIndex + 1, 0, oChild);

			this.updateChildIndex(this.aChildren[iChildIndex], iChildIndex + 1, iChildIndex);
			this.replacePostfixAtElement(this.aChildren[iChildIndex].oClassElement, iChildIndex);
			this.aChildren[iChildIndex].updateElements(iChildIndex);

			this.updateChildIndex(this.aChildren[iChildIndex + 1], iChildIndex, iChildIndex + 1);

			if(iChildIndex > 0) {
				this.replacePostfixAtElement(this.aChildren[iChildIndex + 1].oClassElement, iChildIndex + 1);
			}
			else {
				this.addPostfixToElement(this.aChildren[iChildIndex + 1].oClassElement, iChildIndex + 1);
			}

			this.aChildren[iChildIndex + 1].updateElements(iChildIndex + 1);

			this.updateMultipliers();

			this.repaintFix();

			this.processChildrenHashChanged();

		},

		updateChildIndex : function(oChild, iFrom, iTo) {

			oChild.replaceClass(
				this.__self.CHILD_INDEX_CLASS_NAME_PREFIX + iFrom,
				this.__self.CHILD_INDEX_CLASS_NAME_PREFIX + iTo
				);

		},

		increaseChildrenPostfix : function(iStartIndex) {

			for(var i = this.aChildren.length - 1; i >= iStartIndex; i--) {

				this.replacePostfixAtElement(this.aChildren[i].oClassElement, i + 1);
				this.aChildren[i].updateElements(i + 1);
				this.updateChildIndex(this.aChildren[i], i, i + 1);

			}

		},

		decreaseChildrenPostfix : function(iStartIndex) {

			for(var i = iStartIndex; i < this.aChildren.length; i++) {

				this.replacePostfixAtElement(this.aChildren[i].oClassElement, i - 1);
				this.aChildren[i].updateElements(i - 1);
				this.updateChildIndex(this.aChildren[i], i, i - 1);

			}

		},

		replacePostfixAtElement : function(oElement, iPostfix) {

			for(var i = 0; i < oElement.childNodes.length; i++) {
				this.replacePostfixAtElement(oElement.childNodes[i], iPostfix);
			}

			this.replacePostfixAtNode(oElement, iPostfix);

		},

		replacePostfixAtNode : function(oNode, iPostfix) {

			if(oNode.id) {
				oNode.id = oNode.id.replace(this.__self.REG_EXP_REPLACE, '$1' + (iPostfix > 0? '_' + iPostfix : ''));
			}

			if(oNode.htmlFor) {
				oNode.htmlFor = oNode.htmlFor.replace(this.__self.REG_EXP_REPLACE, '$1' + (iPostfix > 0? '_' + iPostfix : ''));
			}

			if(this.oOptions.bNameHasPostfix && oNode.name) {

				oNode.name = oNode.name.replace(this.__self.REG_EXP_REPLACE, '$1' + (iPostfix > 0? '_' + iPostfix : '') + '$2');

				this.fixNode(oNode);

			}

		},

		removePostfixFromElement : function(oElement) {

			for(var i = 0; i < oElement.childNodes.length; i++) {
				this.removePostfixFromElement(oElement.childNodes[i]);
			}

			this.removePostfixFromNode(oElement);

		},

		removePostfixFromNode : function(oNode) {

			if(this.oOptions.bNameHasPostfix && oNode.name) {
				oNode.name = oNode.name.replace(this.__self.REG_EXP_REPLACE, '$1$2');
			}

			if(oNode.id) {
				oNode.id = oNode.id.replace(this.__self.REG_EXP_REPLACE, '$1');
			}

			if(oNode.htmlFor) {
				oNode.htmlFor = oNode.htmlFor.replace(this.__self.REG_EXP_REPLACE, '$1');
			}

		},

		addPostfixToElement : function(oElement, iPostfix) {

			for(var i = 0; i < oElement.childNodes.length; i++) {
				this.addPostfixToElement(oElement.childNodes[i], iPostfix);
			}

			this.addPostfixToNode(oElement, iPostfix);

		},

		addPostfixToNode : function(oNode, iPostfix) {

			if(oNode.id) {
				oNode.id += '_' + iPostfix;
			}

			if(oNode.htmlFor) {
				oNode.htmlFor += '_' + iPostfix;
			}

			if(this.oOptions.bNameHasPostfix && oNode.name) {

				oNode.name = oNode.name.replace(/^([^\[]+)(\[\])?$/, '$1_' + iPostfix + '$2');
				this.fixNode(oNode);

			}

		},

		fixNode : function(oNode) {

			var sNodeType = oNode.type.toLowerCase();

			if(!Common.Browser.isIE() || !(
				sNodeType == 'text' ||
				sNodeType == 'radio' ||
				sNodeType == 'checkbox'
				)
				) {
				return;
			}

			var oAttributes = {
				'type'      : oNode.type,
				'name'      : oNode.name,
				'id'        : oNode.id,
				'class'     : oNode.className,
				'size'      : oNode.size,
				'maxlength' : oNode.maxLength,
				'value'     : oNode.value,
				'style'     : oNode.style.cssText
				};

			if(oNode.checked) {
				oAttributes.checked = 'checked';
			}

			oNode
				.parentNode
				.replaceChild(
					Common.Dom.createElement('input', oAttributes),
					oNode
					)
				.outerHTML = ''
				;

		},

		destruct : function() {

			if(this.oTemplate) {
				this.oTemplate.destruct();
			}

			this.__base();

		},

		repaintFix : function() {

			if(document.compatMode) {
				return;
			}

			document.body.className += '';

		}

	},
	{

		POSTFIX_ID : '_multiplicator',

		REG_EXP_REPLACE : /^(.+)_\d+(\[\])?$/,

		CHILD_INDEX_CLASS_NAME_PREFIX : 'zf-child_'

	}
	);
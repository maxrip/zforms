ZForms.Widget.Container.SheetContainer = ZForms.Widget.Container.inheritTo(
	{

		__constructor : function(
			oElement,
			oClassElement,
			oOptions
			) {

			this.__base(
				oElement || document.createElement('div'),
				oClassElement,
				oOptions
				);

			this.iCurrentSheetIndex = 0;

		},

		addChild : function(oChild) {

			if(!(oChild instanceof ZForms.Widget.Container.Sheet)) {
				return;
			}

			return this.__base(oChild);

		},

		findSheetIndex : function(oSheet) {

			return this.aChildren.indexOf(oSheet);

		},

		select : function(oSheet) {

			this.selectByIndex(this.findSheetIndex(oSheet));

		},

		prev : function(oSheet) {

			this.selectByIndex(this.findSheetIndex(oSheet) - 1);

		},

		next : function(oSheet) {

			this.selectByIndex(this.findSheetIndex(oSheet) + 1);

		},

		selectByIndex : function(iIndex) {

			if(!this.aChildren[iIndex]) {
				return;
			}

			this.aChildren[this.iCurrentSheetIndex].unselect();
			this.aChildren[iIndex].select();

			this.iCurrentSheetIndex = iIndex;

		}

	},
	{

		CLASS_NAME_INITED : 'zf-sheetcontainer-inited'

	}
	);
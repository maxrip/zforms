ZForms.Widget.Container.Slider.Vertical = ZForms.Widget.Container.Slider.inheritTo(
	{

		setupMarkElementPosition : function(
			oElement,
			dPercent
			) {

			oElement.style.bottom = dPercent + '%';

		},

		updateControlElement : function() {

			var oCurrentControl = this.getCurrentControl();

			oCurrentControl.oElement.style.bottom = Math.round(oCurrentControl.dPosition) + '%';
			oCurrentControl.oValueElement.style.bottom = Math.round(oCurrentControl.dPosition) + '%';
			oCurrentControl.oValueElement.innerHTML = this.getChildren()[this.getCurrentControlIndex()].getValue().get().formatNumber();

		},

		moveRangeElement : function(
			oElement,
			dPositionFrom,
			dPositionTo
			) {

			var iHeight = Math.round(dPositionTo) - Math.round(dPositionFrom);

			Common.Dom.setStyle(
				oElement,
				'bottom: ' + Math.round(dPositionFrom) + '%;' +
				'height: ' + (iHeight > 0? (oElement.parentNode.offsetHeight * iHeight / 100 + 'px;') : '0px;')
				);


		},

		calculateOffset : function(oEvent) {

			return this.oContainerOffset.iTop + this.oContainer.offsetHeight - Common.Event.getAbsoluteCoords(oEvent).iTop;

		},

		calculatePercentByOffset : function(iOffset) {

			return iOffset / this.oContainer.offsetHeight * 100;

		}

	},
	// static
	{

		CLASS_NAME_SLIDER : 'zf-slider-vertical'

	}
	);
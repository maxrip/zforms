// default init
Common.Event.add(
	document,
	Common.Event.TYPE_DOM_CONTENT_LOADED,
	function() {

		var
			aFormElements = Common.Dom.getElementsByClassName(
				document,
				ZForms.Builder.CLASS_NAME_WIDGET,
				'form'
				),
			oElement,
			i = 0
			;

		while(oElement = aFormElements[i++]) {
			if(!Common.Class.match(oElement, ZForms.Widget.Container.Form.CLASS_NAME_INITED)) {
				ZForms.buildForm(oElement);
			}
		}

		setTimeout(
			function() {

				ZForms.notifyObservers(ZForms.EVENT_TYPE_ON_INIT, ZForms);
				ZForms.bInited = true;

			},
			1
			);

	}
	);
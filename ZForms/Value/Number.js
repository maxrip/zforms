ZForms.Value.Number = ZForms.Value.inheritTo(
	{

		set : function(mValue) {

			var
				sValue = mValue.toString().replace(/[^0-9\.\,\-]/g, '').replace(/\,/g, '.'),
				mValue = parseFloat(sValue)
				;
			

			this.mValue = sValue == '' || isNaN(mValue)? '' : mValue;

		},

		match : function(rPattern) {

			return typeof(this.mValue) == 'string'?
				this.__base(rPattern) :
				rPattern.test(this.mValue.toString());
				;

		},
		
		isEqual : function(mValue) {

			if(!(mValue instanceof this.__self || mValue instanceof ZForms.Value || typeof(mValue) == 'number')) {
				return false;
			} 												 

			var oValue = (mValue instanceof this.__self)?
				mValue :
				new this.__self(
					(mValue instanceof ZForms.Value)?
						mValue.get() :
						mValue
					)
				;
		
			return this.get() === oValue.get();

		},

		isGreater : function(mValue) {			
	
			if(!(mValue instanceof this.__self || mValue instanceof ZForms.Value || typeof(mValue) == 'number')) {
				return false;
			} 

			var oValue = (mValue instanceof this.__self)?
				mValue :
				new this.__self(
					(mValue instanceof ZForms.Value)?
						mValue.get() :
						mValue
					)
				;				
		
			return this.get() > oValue.get();

		},

		toStr : function() {

			return ZForms.Resources.getNumberSeparator() == ','?
				this.mValue.toString().replace(/\./g, ',') :
				this.mValue.toString()
				;

		}

	}
	);
ZForms.Value = Abstract.inheritTo(
	{

		__constructor : function(mValue) {

			this.mValue = null;

			this.reset();

			if(mValue != null) {
				this.set(mValue);
			}

		},

		reset : function() {

			this.set('');

		},

		get : function() {

			return this.mValue;

		},

		set : function(mValue) {

			this.mValue = typeof(mValue) == 'string'?
				mValue :
				mValue.toString()
				;

		},

		match : function(rPattern) {

			return rPattern.test(this.get());

		},

		clone : function() {

			var oClonedValue = new this.__self();

			oClonedValue.set(this.get());

			return oClonedValue;

		},

		isEqual : function(mValue) {

			if(!this.checkForCompareTypes(mValue)) {
				return false;
			}

			var oValue = (mValue instanceof this.__self)? mValue : new this.__self(mValue);

			return this.mValue === oValue.mValue;

		},

		isGreater : function(mValue) {

			if(!this.checkForCompareTypes(mValue)) {
				return false;
			}

			var oValue = (mValue instanceof this.__self)? mValue : new this.__self(mValue);

			return this.get().length > oValue.get().length;

		},

		isGreaterOrEqual : function(mValue) {

			return this.isGreater(mValue) || this.isEqual(mValue);

		},

		isLess : function(mValue) {

			return this.checkForCompareTypes(mValue) && !this.isGreaterOrEqual(mValue);

		},

		isLessOrEqual : function(mValue) {

			return this.checkForCompareTypes(mValue) && !this.isGreater(mValue);

		},

		checkForCompareTypes : function(mValue) {

			return mValue instanceof this.__self || typeof(mValue) == 'string';

		},

		isEmpty : function() {

			return this.mValue === '';

		},

		toStr : function() {

			return this.get().toString();

		}

	}
	);
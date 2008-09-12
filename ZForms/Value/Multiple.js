ZForms.Value.Multiple = ZForms.Value.inheritTo(
	{

		reset : function() {

			this.set([]);

		},
		
		set : function(mValue) {
		
			this.mValue = mValue;
		
		},

		match : function(rPattern) {	
			
			if(this.isEmpty()) {
				return rPattern.test('');
			}

			for(var i = 0; i < this.mValue.length; i++) {
				if(rPattern.test(this.mValue[i])) {
					return true;
				}
			}
	
			return false;
			
		},

		clone : function() {
	
			var oClonedValue = new this.__self();
		
			for(var i = 0; i < this.mValue.length; i++) {
				oClonedValue.add(this.mValue[i]);
			}
		
			return oClonedValue;
			
		},
	
		isEqual : function(mValue) {
	
			if(!(mValue instanceof this.__self || mValue instanceof Array)) {
				return false;
			} 
	
			var oValue = mValue instanceof this.__self? mValue : new this.__self(mValue);
	
			if(this.mValue.length != oValue.mValue.length) {
				return false;
			}
	
			for(var i = 0; i < this.mValue.length; i++) {
				if(this.mValue[i] != oValue.mValue[i]) {
					return false;
				}
			}
	
			return true;
	
		},
		
		isGreater : function(mValue) {

			if(!(mValue instanceof this.__self || mValue instanceof Array)) {
				return false;
			} 
	
			var oValue = mValue instanceof this.__self? mValue : new this.__self(mValue);
	
			return this.get().length > oValue.get().length;

		},
	
		isEmpty : function() {
	
			return this.mValue.length == 0;
	
		},

		add : function(mAddValue) {			

			if(this.mValue.contains(mAddValue)) {
				return;
			}
	
			this.mValue.push(mAddValue);
			
		},

		remove : function(mRemoveValue) {

			this.mValue.remove(mRemoveValue);

		}
		
	}
	);
ZForms.Value.Date = ZForms.Value.inheritTo(
	{	
		
		reset : function() {

			this.mValue = [];
			this.mValue[this.__self.PART_YEAR] = '';
			this.mValue[this.__self.PART_MONTH] = '';
			this.mValue[this.__self.PART_DAY] = '';
	
		},

		get : function() {

			if(this.isEmpty()) {
				return '';		
			}
	
			return this.getYear() + '-' + this.getMonth() + '-' + this.getDay();
	
		},

		set : function(mValue) {			

			var oDate = null;
	
			if(mValue instanceof Date) {
				oDate = mValue;
			}
			else {
			
				var aMatched = mValue.match(/^(-?\d{1,4})-(\d{1,2})-(-?\d{1,2})/);
		
				if(aMatched) {				
					oDate = new Date(
						parseInt(aMatched[1], 10),
						parseInt(aMatched[2], 10) - 1,
						parseInt(aMatched[3], 10)
						);
				}
				
			}
			
			if(oDate) {

				this.mValue[this.__self.PART_YEAR] = oDate.getFullYear();
				this.mValue[this.__self.PART_MONTH] = oDate.getMonth() + 1;
				this.mValue[this.__self.PART_DAY] = oDate.getDate();		

			}
			else {		
				this.reset();		
			}
	
		},
	
		isEqual : function(oValue) {

			if(oValue instanceof this.__self.Time) {
				return this.get() + ' 0:0:0' == oValue.get();
			}
	
			if(!(oValue instanceof this.__self) ||
				this.get() != oValue.get()
				) {
				return false;
			}

			return true;

		},
		
		isGreater : function(mValue) {

			var oValue = (mValue instanceof this.__self)?
				mValue :
				new this.__self(
					(mValue instanceof ZForms.Value)?
						Value.get() :
						mValue
					)
				;
	
			if(this.isEmpty() || oValue.isEmpty()) {
				return true;
			}
			if(this.getYear() > oValue.getYear()) {	
				return true;	
			}
			else if(this.getYear() == oValue.getYear()) {
	
				if(this.getMonth() > oValue.getMonth()) {
					return true;
				}
				else {
					return this.getMonth() == oValue.getMonth() && this.getDay() > oValue.getDay();
				}
	
			}
	
			return false;

		},		
	
		isEmpty : function() {
	
			return !this.mValue ||								
				this.mValue[this.__self.PART_YEAR] == '' ||
				this.mValue[this.__self.PART_MONTH] == '' ||
				this.mValue[this.__self.PART_DAY] == ''
				;
	
		},

		getYear : function() {
	
			return this.mValue[this.__self.PART_YEAR];
	
		},

		getMonth : function() {
	
			return this.mValue[this.__self.PART_MONTH];
	
		},

		getDay : function() {
	
			return this.mValue[this.__self.PART_DAY];
	
		},
		
		toStr : function() {
		
			if(this.isEmpty()) {
				return '';
			}
		
			return this.getYear() + '-' + (this.getMonth() < 10? '0' : '') + this.getMonth() + '-' + (this.getDay() < 10? '0' : '') + this.getDay()
		
		}
		
	},
	// static
	{

		PART_YEAR  : 'year',
		PART_MONTH : 'month',
		PART_DAY   : 'day'
		
	}
	);
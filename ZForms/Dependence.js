ZForms.Dependence = Abstract.inheritTo(
	{
	
		__constructor : function(
			iType,
			oFrom,
			sPattern,
			iLogic,
			bInverse
			) {
		
			this.iType = iType;
			this.oFrom = oFrom;
			this.sPattern = sPattern;
			this.iLogic = iLogic || this.__self.LOGIC_OR;
			this.bInverse = bInverse || false;
			
		},
		
		check : function() {
	
			if(this.oFrom.isTemplate()) {
				return true;
			}
	
			var bMatched = this.oFrom.getValue().match(this.sPattern)? true : false;
	
			return this.isInverse()? !bMatched : bMatched;
	
		},
	
		getType : function() {
	
			return this.iType;
	
		},
	
		getFrom : function() {
	
			return this.oFrom;
	
		},
	
		getPattern : function() {
	
			return this.sPattern;
	
		},
	
		getLogic : function() {
	
			return this.iLogic;
	
		},
	
		isInverse : function() {
	
			return this.bInverse;
	
		},
	
		clone : function(oFrom) {
	
			return new this.__self(
				this.getType(),
				oFrom,
				this.getPattern(),
				this.getLogic(),
				this.isInverse()
				);
	
		},
	
		getResult : function() {}
		
	},
	// static
	{

		TYPE_REQUIRED : 1,
		TYPE_VALID    : 2,
		TYPE_ENABLE   : 3,
		TYPE_OPTIONS  : 4,
		TYPE_CLASS    : 5,
		TYPE_CHECK    : 6,

		LOGIC_OR  : 1,
		LOGIC_AND : 2,		

		COMPARE_FUNCTIONS : {
			'='  : 'isEqual',
			'>'  : 'isGreater',
			'>=' : 'isGreaterOrEqual',
			'<'  : 'isLess',
			'<=' : 'isLessOrEqual'
		}						

	}
	);

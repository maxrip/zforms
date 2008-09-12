ZForms.Resources = {

	sLanguage : (document.documentElement.lang? document.documentElement.getAttribute('lang') : 'ru'),

	aMonths : {		
		ru : {
			'normal'   : ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
			'genitive' : ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
		},
		en : {
			'normal'   : ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
			'genitive' : ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
		}
	},

	aDaysOfWeek : {
		ru : ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'],
		en : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
	},

	aNumberSeparators : {

		ru : ',',

		en : '.'		

	},

	getNumberSeparator : function() {

		return this.aNumberSeparators[this.sLanguage];

	},

	getDaysOfWeek : function() {

		return this.aDaysOfWeek[this.sLanguage];
	
	},
	
	getMonthsByType : function(sType) {
	
		return this.aMonths[this.sLanguage][sType];
	
	}

};
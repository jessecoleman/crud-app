(function() {
	window.onload = function() {
		//initialize parse app
		Parse.initialize('67M2CjbYLXlKPZwcKbHWkK1m6Gk1rRpVXucDjOIy', 
						 'pdoBbMrpYabDx8vl8JYzeeBe2VsMl6WFc9Covw5F');
		//create subclass of Parse.Object
		var Review = Parse.Object.extend('Music');

		buildRaty():

		$('#review').submit(submitReview);
	};

	var buildRaty = function() {
		$('#raty-container').raty({score:5});
	};

	//handles data sent to Parse.com
	var submitReview = function() {
		$(this).find('input').each(function() {
			Review.set($(this).attr('id'), $(this).val());
		});

		// after setting properties, save new instance back to database	
		Review.save();
	};
	
})();
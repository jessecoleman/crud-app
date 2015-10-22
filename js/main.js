(function() {
	//Parse object
    var Review;

    window.onload = function() {
		//initialize parse app
		Parse.initialize('67M2CjbYLXlKPZwcKbHWkK1m6Gk1rRpVXucDjOIy', 'pdoBbMrpYabDx8vl8JYzeeBe2VsMl6WFc9Covw5F');
		//create subclass of Parse.Object
		Review = Parse.Object.extend('Music');

		//insert raty element in page
		buildRaty();

        //fetches reviews from Parse.com
        getData();

        //handles submitting of review and sending to Parse.com
		$('#review').submit(function() {
            var review = new Review();
            //submit review
            $(this).find('label').each(function() {
                review.set($(this).next().attr('id'), $(this).next().val());
            });
            //submit rating
            review.set('rating', $('#raty-container').raty('score'));

            // after setting properties, save new instance back to database
            review.save(null, {
                success: getData
            });

            return false;
        });
	};

	var buildRaty = function() {
		$('#raty-container').raty();
	};

    var getData = function() {
        var query = new Parse.Query(Review);

        query.exists('title');

        query.find({
            success: function (results) {
                var title = results.title;
                var content = results.content;
                var rating = results.rating;


                $('#reviews').append();
            }
        });
    };
	
})();
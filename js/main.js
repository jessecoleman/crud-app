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
        buildSlideshow();

        //fetches reviews from Parse.com
        getData();

        //handles submitting of review and sending to Parse.com
		$('#review').submit(function() {
            var review = new Review();
            //submit review
            $(this).find('label').each(function() {
                review.set($(this).next().attr('id'), $(this).next().val());
                $(this).next().val('');
            });
            //submit rating
            var ratyContainer = $('#raty-container');
            review.set('rating', ratyContainer.raty('score'));
            ratyContainer.raty('reload');

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

    var buildSlideshow = function() {
        $('.slider').ready(function() {
            $('.slider').slider({full_width: true, indicators: false});
        });

        var dir = 'img/';
        var fileExtension = '.jpg';
    };

    var getData = function() {
        var query = new Parse.Query(Review);

        query.exists('title');
        query.exists('content');
        query.exists('rating');

        query.find({
            success: function(results) {
                $('#reviews').empty();
                buildReviews(results);
            }
        });
    };

    var buildReviews = function(results) {
        results.forEach(function(result) {
            console.log(result.get('title') + result.get('content') + result.get('rating'));
            var title = $('<span/>').text(result.get('title'));
            var content = $('<p/>').text(result.get('content'));
            var rating = $('<div/>').raty({score: result.get('rating'), readOnly: true});
            //build rating html with materialize
            var card_content = $('<div/>').addClass("card-content").append(rating).append(title).append(content);
            var card = $('<div/>').addClass("card").append(card_content);
            var col = $('<div/>').addClass("col s12 l6").append(card);
            $('#reviews').append(col);

        });
    };
	
})();
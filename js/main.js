(function() {
	//Parse object
    var Review;

    window.onload = function() {
		//initialize parse app
		Parse.initialize('67M2CjbYLXlKPZwcKbHWkK1m6Gk1rRpVXucDjOIy', 'pdoBbMrpYabDx8vl8JYzeeBe2VsMl6WFc9Covw5F');
		//create subclass of Parse.Object
		Review = Parse.Object.extend('Review');

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
            var title = $('<div/>').text(result.get('title')).addClass('card-title black-text align-right');
            var content = $('<p/>').text(result.get('content'));
            var rating = $('<div/>').raty({score: result.get('rating'), readOnly: true});
            var voteUpButton = $('<button/>').addClass('vote-up btn-flat white') //waves-effect waves-green
                                       .append($('<i/>').text('thumb_up').addClass('material-icons'))
                                       .click(function() {voteReview($(this), result)});
            var voteDownButton = $('<button/>').addClass('vote-down btn-flat white') //waves-effect waves-red
                                         .append($('<i/>').text('thumb_down').addClass('material-icons'))
                                         .click(function() {voteReview($(this), result)});
            var deleteButton = $('<button/>').addClass('delete waves-effect waves-red btn-flat white')
                                            .append($('<i/>')).text('delete').addClass('material-icons')
                                            .click(function() {deleteReview(result)});
            var voteCount = $('<span/>').addClass('vote-count').text('Nobody has voted on this review');
            title.append(voteCount).append(deleteButton).append(voteUpButton).append(voteDownButton);
            //build rating html with materialize
            var card_content = $('<div/>').addClass('card-content').append(title).append(rating).append(content);
            var card = $('<div/>').addClass('card').append(card_content);
            var col = $('<div/>').addClass('col s12 l6').append(card);
            $('#reviews').append(col);

        });
    };

    //controls voting of reviews by updating buttons and count
    var voteReview = function(button, result) {
        if(!result.get('total-votes')) {
            console.log('vote set');
            result.set('total-votes', 1);
        } else {
            result.increment('total-votes');
        }
        if(!result.get('up-votes')){
            result.set('up-votes', 0);
        }
        //if upvoting review
        if(button.hasClass('vote-up')) {
            result.increment('up-votes');
            button.prop('disabled', true);
            button.siblings('.vote-down').prop('disabled', false);
        }
        //if downvoting a review
        else {
            button.prop('disabled', true);
            button.siblings('.vote-up').prop('disabled', false);
        }
        result.save({
            success: function() {
                console.log('success');
                button.siblings('.vote-count').text(result.get('up-votes') + " out of " + result.get('total-votes') + " people found this review helpful");
            }
        })
    };

    //delete review
    var deleteReview = function(result) {
        result.destroy({
            success: getData
        });
    };
	
})();
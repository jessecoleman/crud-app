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
		$('#submit-review').click(function() {
            console.log('success');
            //review object
            var review = new Review();
            //user generated data
            var title = $('#title').val();
            var content = $('#content').val();
            var rating = $('#raty-container').raty('score');
            //save user data in review object
            review.set('title', title);
            review.set('content', content);
            review.set('rating', rating);
            //initialize votes at zero
            review.set('total-votes', '0');
            review.set('up-votes', '0');

            // after setting properties, save new instance back to database and clear inputs
            if(title && content && rating) {
                review.save(null, {
                    success: function() {
                        getData();
                        //clear forms
                        $('#raty-container').raty('reload');
                        $('#title').val("");
                        $('#content').val("");
                    }
                });
            } else {
                alert("You must fill in all fields");
            }
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
                //clear out reviews and reload them
                $('#reviews').empty();
                buildReviews(results);
            }
        });
    };

    //adds each review object to the dom with materialize html/css
    var buildReviews = function(results) {
        results.forEach(function(result) {
            var title = $('<div/>').text(result.get('title')).addClass('card-title black-text');
            var content = $('<p/>').text(result.get('content')).prepend($('<br>'));
            var rating = $('<span/>').raty({score: result.get('rating'), readOnly: true});
            var voteUpButton = $('<button/>').addClass('vote-up btn-flat white waves-effect waves-green')
                                             .append($('<i/>').text('thumb_up').addClass('material-icons'))
                                             .click(function() {voteReview($(this), result)});
            var voteDownButton = $('<button/>').addClass('vote-down btn-flat white waves-effect waves-red')
                                               .append($('<i/>').text('thumb_down').addClass('material-icons'))
                                               .click(function() {voteReview($(this), result)});
            var deleteButton = $('<button/>').addClass('delete waves-effect waves-red btn-flat white')
                                             .append($('<i/>')).text('delete').addClass('material-icons')
                                             .click(function() {deleteReview(result)});
            var voteCount = $('<span/>').addClass('vote-count').text('Nobody has voted on this review');
            title.prepend(voteDownButton).prepend(voteUpButton).prepend(deleteButton);
            //build rating html with materialize
            var cardContent = $('<div/>').addClass('card-content').append(title).append(rating).append(voteCount).append(content);
            var card = $('<div/>').addClass('card').append(cardContent);
            var col = $('<div/>').addClass('col s12 l6').append(card);
            $('#reviews').append(col);

        });
    };

    //controls voting of reviews by updating buttons and count
    var voteReview = function(button, result) {
        //increment total votes
        result.increment('total-votes');
        alert(result.get('total-votes'));
        //if upvoting review
        if(button.hasClass('vote-up')) {
            result.increment('up-votes');
            button.prop('disabled', true).removeClass('waves-effect waves-green');
            button.siblings('.vote-down').prop('disabled', false).addClass('waves-effect waves-red');
        }
        //if downvoting a review
        else {
            button.prop('disabled', true).removeClass('waves-effect waves-red');
            button.siblings('.vote-up').prop('disabled', false).addClass('waves-effect waves-green');
        }
        result.save(null, {
            success: function() {
                button.siblings('.vote-count').text(result.get('up-votes') + " out of " +
                                                    result.get('total-votes') + " people found this review helpful");
            }
        });
    };

    //delete review
    var deleteReview = function(result) {
        result.destroy({
            success: getData
        });
    };

})();
/*  Cole Chamberlin
    10/27/15
    INFO 343
    Crud-App

    This file contains all the logic for index.html, handling all user interactivity and data loading and saving
*/

(function() {
    "use strict";

	//Parse object
    var Review;
    //User object
    var currentUser;

    //initializes page, loading things like current user, controls for reviewing and voting, and some ui stuff
    $(document).ready(function() {
		//initialize parse app
		Parse.initialize('67M2CjbYLXlKPZwcKbHWkK1m6Gk1rRpVXucDjOIy', 'pdoBbMrpYabDx8vl8JYzeeBe2VsMl6WFc9Covw5F');

		currentUser = Parse.User.current();
        if(currentUser) {
            $('nav a').text('logout').prop('href', 'login.html?logout');
            $('#nav-mobile').prepend($('<li/>').text(currentUser.get('username')));
            $('#login-to-review').hide();
        } else {
            $('#review-container').hide();
        }
		//create subclass of Parse.Object
		Review = Parse.Object.extend('Review');

        //login button redirects to login.html
        $('#login-button').click(function() {
            window.location.replace('login.html');
        });

		//insert raty element in page
		buildRaty();
        //insert slideshow in page
        buildSlideshow();
        //fetches reviews from Parse.com
        getData();

        //handles submitting of review and sending to Parse.com
		$('#submit-review').click(function() {
            //review object
            var review = new Review();
            //user generated data
            var title = $('#title').val();
            var content = $('#content').val();
            var rating = $('#raty-container').raty('score');

            // after setting properties, save new instance back to database and clear inputs
            if(title && content && rating && currentUser) {
                review.save({
                    'title': title,
                    'content': content,
                    'rating': rating,
                    'reviewer': currentUser,
                    'totalVotes': 0,
                    'upVotes': 0
                }, {
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
	});

	//initializes raty widget
    var buildRaty = function() {
		$('#raty-container').raty();
	};

    //initializes materialize slideshow
    var buildSlideshow = function() {
        $('.slider').ready(function() {
            $('.slider').slider({full_width: true, indicators: false});
        });


    };

    //performs query on Parse database, passes results to function for processing
    var getData = function() {
        var query = new Parse.Query(Review);

        query.exists('title');
        query.exists('content');
        query.exists('rating');
        query.include('reviewer');

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
        var ratings = [0, 0, 0, 0, 0];
        var numRatings = 0;
        results.forEach(function(result) {
            var title = $('<div/>').text(result.get('title')).addClass('card-title black-text');
            var content = $('<p/>').text(result.get('content')).prepend($('<br>'));
            var rating = $('<span/>').raty({score: result.get('rating'), readOnly: true});
            var reviewer = $('<span/>').text("Author: " + result.get('reviewer').get('username')).addClass('reviewer');
            //if review was created by current user
            if(currentUser && currentUser.id === result.get('reviewer').id) {
                var deleteButton = $('<button/>').addClass('delete waves-effect waves-red btn-flat white')
                    .append($('<i/>')).text('delete').addClass('material-icons')
                    .click(function() {deleteReview(result)});
                title.prepend(deleteButton);
            } else {
                var voteUpButton = $('<button/>').addClass('vote-up btn-flat white waves-effect waves-green')
                    .append($('<i/>').text('thumb_up').addClass('material-icons'))
                    .click(function() {voteReview($(this), result)});
                var voteDownButton = $('<button/>').addClass('vote-down btn-flat white waves-effect waves-red')
                    .append($('<i/>').text('thumb_down').addClass('material-icons'))
                    .click(function() {voteReview($(this), result)});
                title.prepend(voteDownButton).prepend(voteUpButton);
            }
            var voteCount = $('<span/>').addClass('vote-count');
                if(result.get('totalVotes')) {
                    voteCount.text(result.get('upVotes') + " out of " +
                                   result.get('totalVotes') + " people found this review helpful");
                } else {
                    voteCount.text('Nobody has voted on this review');
                }
            //build rating html with materialize
            var cardContent = $('<div/>').addClass('card-content').append(title).append(rating).append(voteCount).append(reviewer).append(content);
            var card = $('<div/>').addClass('card').append(cardContent);
            var col = $('<div/>').addClass('col s12 l6').append(card);
            $('#reviews').append(col);

            //get average rating
            ratings[result.get('rating') - 1]++;
            numRatings++;
        });

        buildTable(ratings, numRatings);
    };

    //does the math to determine correct widths and heights of bars
    var buildTable = function(ratings, numRatings) {
        //longest bar set to full length of view, other bars scaled appropriately
        var max = Math.max.apply(null, ratings) / numRatings * 100;
        var rateTotal = 0;
	    $('rect').each(function(index) {
            $(this).attr('width', Math.floor(ratings[index] / numRatings * 10000 / max) + '%');
            $(this).attr('x', 0);
            $(this).attr('y', 21 * index);
            $(this).attr('height', '20%');
		    rateTotal += ratings[index] * (index + 1);
        });
	    var rateAverage = rateTotal / numRatings;
	    $('#average-rating').html(Math.round(rateAverage * 10) / 10 + '<i class="material-icons">star</i>');
    };

    //controls voting of reviews by updating buttons and count
    var voteReview = function(button, result) {
        //if clicking upvote
        if(button.hasClass('vote-up')) {
            //if upvote isn't already selected
            if(button.hasClass('white')) {
                //if user had previously downvoted
                if(button.siblings('.vote-down').hasClass('red')){
                    result.increment('upVotes');
                    //switch button colors that indicate selected button
                    button.addClass('green').removeClass('white');
                    button.siblings('.vote-down').removeClass('red').addClass('white');
                }
                //if user hadn't voted at all yet
                else {
                    result.increment('totalVotes');
                    result.increment('upVotes');
                    button.addClass('green').removeClass('white');
                }
            }
            //if upvote is selected
            else {
                result.increment('upVotes', -1);
                result.increment('totalVotes', -1);
                //switch button colors that indicate selected button    
                button.removeClass('green').addClass('white');
            }
        }
        //if clicking downvote
        else {
            //if downvote isn't already selected
            if(button.hasClass('white')) {
                //if user had previously upvoted
                if(button.siblings('.vote-up').hasClass('green')){
                    result.increment('upVotes', -1);
                    button.addClass('red').removeClass('white');
                    button.siblings('.vote-up').removeClass('green').addClass('white');
                }
                //if user hadn't voted at all yet
                else {
                    result.increment('totalVotes');
                    button.addClass('red').removeClass('white');
                }
            }
            //if downvote is selected
            else {
                result.increment('totalVotes', -1);
                button.removeClass('red').addClass('white');
            }
        }
        result.save(null, {
            success: function() {
                button.parent().siblings('.vote-count').text(result.get('upVotes') + " out of " +
                                                    result.get('totalVotes') + " people found this review helpful");
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
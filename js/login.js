(function() {
    $(document).ready(function() {
        $('#signup').hide();
        //initialize parse
        Parse.initialize('67M2CjbYLXlKPZwcKbHWkK1m6Gk1rRpVXucDjOIy', 'pdoBbMrpYabDx8vl8JYzeeBe2VsMl6WFc9Covw5F');

        var logout = window.location.search.substring(1);
        if(logout) {
            Parse.User.logOut();
        }

        $('#sign-up').click(function() {
            $('#signup').show();
            $('#login').hide();
            $('#signup-text').hide();
        });

        $('#login-button').click(function() {
            var username = $('#username').val();
            var password = $('#password').val();

            Parse.User.logIn(username, password, {
                success: function() {
                    window.location.replace('index.html');
                },
                error: function() {
                    alert(error.code + ' ' + error.message);
                }
            })
        });

        $('#signup-button').click(function() {
            var username = $('#new-username').val();
            var password = $('#new-password').val();
            var passwordConfirm = $('#new-password-confirm').val();

            if(password === passwordConfirm) {
                var user = new Parse.User();
                user.set('username', username);
                user.set('password', password);

                user.signUp(null, {
                    success: function() {
                        window.location.replace('index.html');
                    },
                    error: function(user, error) {
                        alert(error.code + ' ' + error.message);
                    }
                });
            } else {
                alert('Passwords don\'t match');
            }
        });
    });
})();
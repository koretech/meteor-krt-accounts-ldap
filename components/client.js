Meteor.loginWithLdap = function(user, password, callback) {
	if (!Meteor.user()) {
		var loginRequest = {
			ldap: true,
			username: user,
			ldap_password: password
		};

		//send the login request
		Accounts.callLoginMethod({
			methodArguments: [loginRequest],
			userCallback: callback
		});
	}	else if (callback) {
		callback();
	}

};

var ActiveDirectory = Npm.require('activedirectory');

Accounts.registerLoginHandler(function (loginRequest) {
	//Only process ldap requests
	if (!loginRequest.ldap) {
		return undefined;
	}

	var opts = Meteor.settings.ldap;

	//Open connection to Active Directory
	var ad = new ActiveDirectory(opts);

	var ldapData = null;



	//Check if the user has an account with ldap data
	var user = Meteor.users.findOne({username: loginRequest.username});
	if ((user) && (user.services) && (user.services.ldap)) {

		ldapData = user.services.ldap;

	} else { //Retrieve ldap data

		//Lookup SAM account
		var lookup = Async.runSync(function (done) {
			ad.findUser(loginRequest.username, done);
		});

		if ((lookup.error) || (!lookup.result)) {
//			console.log("No user found or error");
			throw new Meteor.Error(403, "User not found");
		}

		ldapData = lookup.result;
	}

	var auth = Async.runSync(function (done) {
		ad.authenticate(ldapData.cn, loginRequest.ldap_password, done);
	});

	//Authentication failed.
	if (!auth.result) {
//		console.log("Authentication failed!");
		throw new Meteor.Error(403, "Incorrect password");
	}

//	console.log('Authentication succeeded!');

	//Create the user if it does not exit.
	var userId = null;
	if (!user) {

		var username = loginRequest.username || ldapData.sAMAccountName || "New User";

		//Create the user
		userId = Meteor.users.insert({
			username: username,
			profile: {
				firstname: ldapData.givenName,
				lastname: ldapData.sn
			},
			services: {
				ldap: ldapData
			},
			type: 'staff'
		});

	} else {
		//Get the user id of the already created user
		userId = user._id;

		//If user doesn't have ldap data yet, update the user with it.
		if (!(user.services && user.services.ldap)) {
			Meteor.users.update(userId,
				{$set: {services: {ldap: ldapData}}}
			);
		}
	}

	//creating the token and add to the user
	var stampedToken = Accounts._generateStampedLoginToken();
	Meteor.users.update(userId,
		{$push: {'services.resume.loginTokens': stampedToken}}
	);

	//send logged in user's user id
	return {
		userId: userId,
		type: 'ldap',
		token: stampedToken.token,
		tokenExpires: Accounts._tokenExpiration(stampedToken.when)
	}

});


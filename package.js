Package.describe({
	name: 'krt:accounts-ldap',
	summary: 'Koretech LDAP authentication',
	version: '0.1.1',
	git: 'https://github.com/koretech/meteor-krt-accounts-ldap.git',
	documentation: null
});

Package.onUse(function(api){

	api.versionsFrom('METEOR@1.0');

	Npm.depends({
		"activedirectory": "0.5.1"
	});

	api.use([
		'underscore',
		'accounts-base',
		'krt:core@0.1.2'
	], ['client', 'server']);

	api.use([
		'meteorhacks:npm@1.2.2'
	], 'server');

	api.imply([
		'accounts-base'
	]);

	api.addFiles([
		'namespaces.js'
	], ['client', 'server']);

	api.addFiles(['components/client.js'], 'client');
	api.addFiles(['components/server.js'], 'server');

});

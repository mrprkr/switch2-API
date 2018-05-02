require('dotenv').config();
const request = require("request-promise");
const cheerio = require('cheerio');
request.defaults({jar: true});

module.exports = (cb) => {
	const cookiejar = request.jar();

	console.log('starting login...')

	request({
		uri: "https://my.switch2.co.uk/Login",
		jar: cookiejar,
		transform: function (body) {
			return cheerio.load(body);
		}
	}).then(($) => {
		const verificationToken = $('#LoginForm > input').attr("value");
		console.log('loaded login page...')

		request({
			uri: "https://my.switch2.co.uk/Login",
			method: 'POST',
			jar: cookiejar,
			form: {
				__RequestVerificationToken: verificationToken,
				UserName: process.env.USERNAME,
				Password: process.env.PASSWORD,
			},
			followAllRedirects: true,
			// resolveWithFullResponse: true,
			transform: function (body) {
				return cheerio.load(body);
			}
		}).then(($) => {
			console.log('submitted login form...')

			// Customer data (might be useful)
			const customer = {
				name: $('.customer-info-name').text(),
				acn: $('.customer-info-account-number').text(),
				address: $('.customer-info-address').text(),
			}

			if(customer.name){
				console.log(`Logged in as ${customer.name}`);
				cb(null, cookiejar);
			} else {
				// no login
				console.error('Login not successful');
				cb('Login not successful');
			}

		}).catch(function(e) {
		    console.log(e)
				cb(e);
		});
	}).catch(function(e) {
	    console.log(e);
			cb(e);
	});
}

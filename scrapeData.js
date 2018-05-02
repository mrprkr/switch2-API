require('dotenv').config();

const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const _ = require('underscore');

// Pass in the db and cookie object
module.exports = (db, cookiejar) => {
console.log('starting scrape...')

// Options for request-promise
const options = {
  uri: `https://my.switch2.co.uk/MeterReadings/History`,
	jar: cookiejar,
  transform: function (body) {
    return cheerio.load(body);
  }
};

// Make the request
rp(options)
  .then(($) => {
		// Parse and store the records
		const records = [];
		$('.meter-reading-history-table-data-row.desktop-layout').each(function(i, elem) {
			const date = moment.utc($(this).find('.meter-reading-history-table-data-date-row-item').text(), 'Do MMM YYYY').toDate();
			const amount = parseInt($(this).find('.meter-reading-history-table-data-amount-row-item').text());
			records.push({
				date,
				amount,
			});
		});

		// Log how many were found
		console.log(`Found ${records.length} records...`)
		if(!records.length){
			console.log('No records found...', $.html())
		} else {
			// Store the parsed records in mongo
			const collection = db.collection('records');
			_.each(records, (record) => {
				// Upsert if the record does not exist yet
				collection.update({date: record.date}, record, {upsert: true}, (err, result) => {
					if(err) console.error(err);
					// Record updated
					console.log(`Updated ${record.date} to ${record.amount}`);
				});
			});
		}
  })
  .catch((err) => {
      // REQUEST FAILED: ERROR OF SOME KIND
			console.error(err);
  });
}

/** SERVER.JS FOR MEMBER MAIN WEBSITE **/

var path = require('path');
var express = require('express');
var request = require('superagent');
var Promise = require('promise');
var cors = require('cors');
var bodyParser = require('body-parser');
var config = require('./config/backend-variables.js');
var FilestackPermissions = require('./config/core.js');
var app = express();
var server = require('http').createServer(app);
var fireAdmin = require("firebase-admin");
var firebase = require('firebase');
const gm = require('gm').subClass({
	imageMagick: true
});;
var fs = require('fs');
const PROJECT_ID = 'kutz-world'
const GoogleStorage = require('@google-cloud/storage');
const gStorage = GoogleStorage({
	projectId: PROJECT_ID,
	keyFilename: './Kutz-World-887edfa70126.json'
});
const KUTZ_GALLERY_BUCKET = 'kutz-world-profile-gallery-media';
var apiTokenData = {};

var serviceAccount = require("./kuts-world-firebase-adminsdk-lmqls-9f01c08e23.json");
fireAdmin.initializeApp({
	credential: fireAdmin.credential.cert(serviceAccount),
	databaseURL: "https://kuts-world.firebaseio.com"
});


app.use('/', express.static(__dirname + '/'));
//app.use('/imgDir', express.static(process.cwd() + '/images/icons'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
	extended: true
})); // for parsing application/x-www-form-urlencoded
app.use(cors());

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT, PATCH");
	res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
	next();
});

/*app.get('/policy', function (req, res) {
	console.log("This is the policy for this request: " + FilestackPermissions().policy);
	console.log("This is the signature: " + FilestackPermissions().signature);
	res.send(FilestackPermissions());
}); 

app.delete('/admin/delete-file', function (req, res) {
	request
		.delete('http://www.filestackapi.com/api/file/' + req.body.handle + '?key=' + config.FILESTACK_API_KEY
			   + '&policy=' + FilestackPermissions().policy + '&signature=' + FilestackPermissions().signature)
		.end(function (err, data) {
			if (data.status == 403) {
				console.log(err);
				res.send(403, '403 Forbidden');
			} else if (data.status == 401) {
				console.log(err);
			} else {
				console.log(data.status);
				res.json({
					'status': data.status
				});
			}
		});
}); */

app.get('/member-api/get-profile', function (req, res) {
	console.log('\nRequesting user profile from API with the following query parameters.')
	console.log(req.query);
	request.get('http://localhost:9090/member-api/get-profile')
		.query({
			UID: req.query.UID
		})
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.query.apiToken
		})
		.end(function (err, result) {
			if (err) {
				if (err.status == 500) {
					res.status(500).send(null);
				} else if (err.status == 404) {
					res.status(404).send([]);
				}
			} else {
				console.log(result.body);
				res.json(result.body);
			}
			// Calling the end function will send the request 
		});
});

app.get('/get-users', function (req, res) {
	console.log('\nRequesting users from get-users API with the following query parameters.');
	console.log(req.query);

	request.get('http://localhost:9090/member-api/get-users')
		.query({
			authIDArray: req.query.authIDArray, // <----- this is a firebase array
			location: req.query.location
		})
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.query.apiToken
		})
		.end(function (err, result) {
			if (err) {
				console.log(err);
				if (err.status == 400) {
					res.status(400).send({
						message: 'Bad parameter. Must provide an array and api token.'
					});
				} else if (err.status == 404) {
					res.status(404).send({
						message: 'Not found. No users found.'
					});
				} else {
					res.status(500).send({
						message: 'Something went wrong.'
					});
				}
			} else {
				console.log(result.body);
				res.status(200).send(result.body);
			}
		});
});

app.get('/member-api/find-users-near-me-by-distance', function (req, res) {
	console.log('\nRequesting last online users near me from API with the following query parameters.')
	console.log(req.query);
	request.get('http://localhost:9090/member-api/find-users-near-me-by-distance')
		.query({
			location: req.query.location,
			proximity: req.query.proximity
		})
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.query.apiToken
		})
		.end(function (err, result) {
			if (result && result.body)
				console.log(result.body);
			if (!err) {
				res.json(result.body);
			} else {
				res.status(500).send({
					message: "Error finding users near location."
				});
			}
			// Calling the end function will send the request 
		});
});

app.get('/member-api/find-users', function (req, res) {
	console.log('\nRequesting users near me from API with the following query parameters.')
	console.log(req.query);
	request.get('http://localhost:9090/member-api/find-users')
		.query({
			location: req.query.location,
			limit: req.query.limit,
			offset: req.query.offset
		})
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.query.apiToken
		})
		.end(function (err, result) {
			if (result && result.body)
				console.log(result.body);
			if (!err) {
				res.json(result.body);
			} else {
				res.status(500).send({
					message: "Error finding users near location."
				});
			}
			// Calling the end function will send the request 
		});
});

app.get('/get-thumbnail', function (req, res) {
	console.log('\nRequesting user thumbnail from API with the following query parameters.')
	console.log(req.query);
	request.get('http://localhost:9090/member-api/get-thumbnail')
		.query({
			object_id: req.query.object_id
		})
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.query.apiToken
		})
		.end(function (err, result) {
			if (err) {
				if (err.status && err.status == 404) {
					console.log('No thumbnail found.');
					res.status(404).send([]);
				} else {
					res.status(500).send({
						message: "Error retrieving thumbnail."
					});
				}
			} else {
				console.log(result.body);
				res.json(result.body);
			}
		});
});

app.get('/get-banner', function (req, res) {
	console.log('\nRequesting user banner from API with the following query parameters.')
	console.log(req.query);
	request.get('http://localhost:9090/member-api/get-banner')
		.query({
			object_id: req.query.object_id
		})
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.query.apiToken
		})
		.end(function (err, result) {
			if (err) {
				if (err.status && err.status == 404) {
					console.log('No banner found.');
					res.status(404).send([]);
				} else {
					res.status(500).send({
						message: "Error retrieving banner."
					});
				}
			} else {
				console.log(result.body);
				res.json(result.body);
			}
		});
});

app.get('/get-all-albums', function (req, res) {
	console.log('\nRequesting user albums from API with the following query parameters.')
	console.log(req.query);
	request.get('http://localhost:9090/member-api/get-all-albums')
		.query({
			object_id: req.query.object_id
		})
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.query.apiToken
		})
		.end(function (err, result) {
			if (err) {
				if (err.status && err.status == 404) {
					console.log('No albums found.');
					res.sendStatus(404);
				} else {
					res.sendStatus(500);
				}
			} else {
				console.log(result.body);
				res.json(result.body);
			}
		});
});

app.get('/get-media-from-album', function (req, res) {
	console.log('\nRequesting user album-media from API with the following query parameters.')
	console.log(req.query);
	request.get('http://localhost:9090/member-api/get-media-from-album')
		.query({
			album_id: req.query.album_id
		})
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.query.apiToken
		})
		.end(function (err, result) {
			if (err) {
				if (err.status && err.status == 404) {
					console.log('No media found.');
					res.sendStatus(404);
				} else {
					res.sendStatus(500);
				}
			} else {
				console.log(result.body);
				res.json(result.body);
			}
		});
});

app.get('/policy', function (req, res) {
	console.log("This is the policy for this request: " + FilestackPermissions().policy);
	console.log("This is the signature: " + FilestackPermissions().signature);
	res.send(FilestackPermissions());
});

app.get('/*', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});


/*app.use(function(req, res) {
    // Use res.sendfile, as it streams instead of reading the file into memory.
    res.sendFile(__dirname + '/index.html');
});*/

var authData = {
	client_id: config.auth0.AUTH0_NONINTERACTIVE_CLIENT_CLIENT_ID,
	client_secret: config.auth0.AUTH0_NONINTERACTIVE_CLIENT_SECRET,
	grant_type: 'client_credentials',
	audience: config.auth0.AUTH0_MEMBER_API_AUDIENCE
};

app.post('/get-api-token', function (req, res) {
	request
		.post(config.auth0.AUTH0_API_ACCESS_TOKEN_URL)
		.send(authData)
		.end(function (err, payload) {
			if (err) {
				res.status(err.status).send({
					message: 'Invalid credentials. Token not issued.'
				});
			} else {
				console.log(payload.body);
				res.status(200).send(payload.body);
			}
		});
});

app.patch('/set-last-online', function (req, res) {
	console.log('=======================================');
	console.log('\nSetting Last Online time!\n');
	console.log(req.body);
	console.log('=======================================');
	request
		.patch(config.api.ADMIN_API_SERVER_URL + '/member-api/set-last-online')
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.body.apiToken
		})
		.send(req.body)
		.end(function (err, result) {
			if (err) {
				if (err.message)
					console.log(err.message);
				else console.log(err);
				res.status(500).send({
					status: err.status,
					message: err.status + ": Error. Unable to set last online time."
				});
			} else if (result) {
				console.log(result.status);
				console.log(result.body);
				res.status(200).send({
					message: "We lit.",
					updated_profile: result.body.updated_profile
				});
			}
		});
});

app.patch('/set-offline', function (req, res) {
	console.log('\nSetting user as offline!\n');
	request
		.patch(config.api.ADMIN_API_SERVER_URL + '/member-api/set-offline')
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.body.apiToken
		})
		.send(req.body)
		.end(function (err, result) {
			if (err) {
				if (err.message)
					console.log(err.message);
				else console.log(err);
				res.status(500).send({
					status: err.status,
					message: err.status + ": Error. Unable to mark user as offline."
				});
			} else if (result) {
				console.log(result.status);
				console.log(result.body);
				res.status(200).send({
					message: "We lit.",
					updated_profile: result.body.updated_profile
				});
			} else {
				res.sendStatus(500);
			}
		});
});

app.patch('/update-basic-info', function (req, res) {
	console.log('\nUpdating basic profile info!\n');
	request
		.patch(config.api.ADMIN_API_SERVER_URL + '/member-api/update-basic-info')
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.body.apiToken
		})
		.send(req.body)
		.end(function (err, result) {
			if (result) {
				console.log(result.status);
				console.log(result.body);
			}
			if (err) {
				if (err.message)
					console.log(err.message);
				else console.log(err);
				res.status(500).send({
					status: err.status,
					message: err.status + ": Error. Unable to update basic info."
				});
			} else {
				res.status(200).send({
					message: "We lit.",
					updated_profile: result.body.updated_profile
				});
			}
		});
});

app.patch('/update-location-info', function (req, res) {
	console.log('\nUpdating location profile info!\n');
	request
		.patch(config.api.ADMIN_API_SERVER_URL + '/member-api/update-location-info')
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.body.apiToken
		})
		.send(req.body)
		.end(function (err, result) {
			if (result) {
				console.log(result.status);
				console.log(result.body);
			}
			if (err) {
				if (err.message)
					console.log(err.message);
				else console.log(err);
				res.status(500).send({
					status: err.status,
					message: err.status + ": Error. Unable to update additional info."
				});
			} else {
				res.status(200).send({
					message: "We lit.",
					updated_profile: result.body.updated_profile
				});
			}
		});
});

app.patch('/update-personal-info', function (req, res) {
	console.log('\nUpdating personal profile info!\n');
	request
		.patch(config.api.ADMIN_API_SERVER_URL + '/member-api/update-personal-info')
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.body.apiToken
		})
		.send(req.body)
		.end(function (err, result) {
			if (result) {
				console.log(result.status);
				console.log(result.body);
			}
			if (err) {
				if (err.message)
					console.log(err.message);
				else console.log(err);
				res.status(500).send({
					status: err.status,
					message: err.status + ": Error. Unable to update additional info."
				});
			} else {
				res.status(200).send({
					message: "We lit.",
					updated_profile: result.body.updated_profile
				});
			}
		});
});

app.patch('/update-thumbnail', function (req, res) {
	console.log('\n\n==========================================================================')
	console.log('\nUpdating user thumbnail!\n');
	request
		.patch(config.api.ADMIN_API_SERVER_URL + '/member-api/update-thumbnail')
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.body.apiToken
		})
		.send(req.body)
		.end(function (err, result) {
			if (result) {
				console.log(result.status);
				console.log(result.body);
			}
			if (err) {
				if (err.message)
					console.log(err.message);
				else console.log(err);
				res.status(500).send({
					status: err.status,
					message: err.status + ": Error. Unable to update thumbnail."
				});
			} else {
				console.log('updated thumbnail is:');
				console.log(result.body.updated_profile.thumbnail);
				res.status(200).send({
					message: "We lit.",
					updated_profile: result.body.updated_profile
				});
			}
		});
});

app.patch('/update-banner', function (req, res) {
	console.log('\nUpdating user banner!\n');
	request
		.patch(config.api.ADMIN_API_SERVER_URL + '/member-api/update-banner')
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.body.apiToken
		})
		.send(req.body)
		.end(function (err, result) {
			if (result) {
				console.log(result.status);
				console.log(result.body);
			}
			if (err) {
				if (err.message)
					console.log(err.message);
				else console.log(err);
				res.status(500).send({
					status: result.status,
					message: result.status + ": Error. Unable to update banner."
				});
			} else {
				console.log('updated banner is:');
				console.log(result.body.updated_profile.thumbnail);
				res.status(200).send({
					message: "We lit.",
					updated_profile: result.body.updated_profile
				});
			}
		});
});

app.post('/add-thumbnail-to-album', function (req, res) {
	console.log(req.body);
	console.log('\n\nRequesting to save thumbnail to album!\n');
	request
		.post(config.api.ADMIN_API_SERVER_URL + '/member-api/add-thumbnail-to-album')
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.body.apiToken
		})
		.send(req.body)
		.end(function (err, result) {
			if (err) {
				console.log(err);
				res.sendStatus(500);
			} else if (result) {
				res.sendStatus(200);
				console.log(result.status);
				console.log(result.message);
			}
		});
});

app.post('/add-banner-to-album', function (req, res) {
	console.log(req.body);
	console.log('\n\nRequesting to save banner to album!\n');
	request
		.post(config.api.ADMIN_API_SERVER_URL + '/member-api/add-banner-to-album')
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.body.apiToken
		})
		.send(req.body)
		.end(function (err, result) {
			if (err) {
				console.log(err);
				res.sendStatus(500);
			} else if (result) {
				res.sendStatus(200);
				console.log(result.status);
				console.log(result.message);
			}
		});
});


app.post('/register-basic-profile', function (req, res) {
	console.log(req.body);
	console.log('\n\nRequesting to register basic user profile!\n');
	request
		.post(config.api.ADMIN_API_SERVER_URL + '/member-api/register-basic-profile')
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.body.apiToken
		})
		.send(req.body.profile)
		.end(function (err, result) {
			console.log(result);
			console.log(result.status);
			if (err) {
				res.sendStatus(result.status);
			} else {
				res.status(200).send({
					message: "We lit.",
					profile: result.body.profile
				});
			}
		});
});

app.post('/save-interests', function (req, res) {
	console.log(req.body);
	console.log('\n\nRequesting to save user interests!\n');
	request
		.post(config.api.ADMIN_API_SERVER_URL + '/member-api/save-interests')
		.set({
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + req.body.apiToken
		})
		.send(req.body)
		.end(function (err, result) {
			console.log(result.status);
			console.log(result.body);
			if (err) {
				console.log(err);
				res.status(500).send({
					status: result.status,
					message: result.status + ": Error. Unable to save interests."
				});
			} else {
				res.status(200).send({
					message: "We lit.",
					updated_profile: result.body.updated_profile
				});
			}
		});
});

app.post('/resize-image-and-save', function (req, res) {

	console.log('\n\n==========================================================================')
	console.log('\n\nCall to resize-image-and-save!\n');
	console.log(req.body);
	var handle = (req.body.imageUrl).match(/([^\/]*)\/*$/)[1];
	console.log('The image handle is %s:', handle);
	var imageCategory = req.body.imageCategory;
	var mimeType = req.body.mimeType;
	var extension = mimeType.split('/')[1]
	console.log('Mimetype of file is %s and its extension is %s.', mimeType, extension);
	var width = 600,
		height = 800;
	var completeUrl = req.body.imageUrl + '?policy=' + FilestackPermissions().policy + '&signature=' + FilestackPermissions().signature;
	console.log('The complete image url is %s:', completeUrl);

	var myDir = './TempFiles/Originals/' + imageCategory;

	if (!isDirSync('./TempFiles')) {
		fs.mkdirSync('./TempFiles');
		fs.mkdirSync('./TempFiles/' + imageCategory);
		fs.mkdirSync('./TempFiles/' + imageCategory + '/Originals');
	} else if (!isDirSync('./TempFiles/' + imageCategory)) {
		fs.mkdirSync('./TempFiles/' + imageCategory);
		fs.mkdirSync('./TempFiles/' + imageCategory + '/Originals');
	} else if (!isDirSync('./TempFiles/' + imageCategory + '/Originals')) {
		fs.mkdirSync('./TempFiles/' + imageCategory + '/Originals');
	}

	var filePath1 = './TempFiles/' + imageCategory + '/Originals/' + handle + '.' + extension;
	console.log('the file path for the original file is %s', filePath1);

	if (!fs.existsSync(filePath1)) { // make sure the file isn't already saved to the disk
		download(completeUrl, filePath1, function () {
			if (!isDirSync('./TempFiles')) {
				fs.mkdirSync('./TempFiles');
				fs.mkdirSync('./TempFiles/' + imageCategory);
				fs.mkdirSync('./TempFiles/' + imageCategory + '/Cropped');
			} else if (!isDirSync('./TempFiles/' + imageCategory)) {
				fs.mkdirSync('./TempFiles/' + imageCategory);
				fs.mkdirSync('./TempFiles/' + imageCategory + '/Cropped');
			} else if (!isDirSync('./TempFiles/' + imageCategory + '/Cropped')) {
				fs.mkdirSync('./TempFiles/' + imageCategory + '/Cropped');
			}

			var filePath2 = './TempFiles/' + imageCategory + '/Cropped/' + handle + '.' + extension;
			console.log('the file path for the cropped file is %s', filePath2);

			if (!fs.existsSync(filePath2)) {
				gm(filePath1).resize(null, 800)
					.gravity('Center') // Move the starting point to the center of the image.
					.crop(width, height)
					.write(filePath2, function (err) {
						if (err) {
							console.log(err);
							res.sendStatus(500);
						} else {
							gStorage
								.bucket(KUTZ_GALLERY_BUCKET)
								.upload(filePath1, {
									destination: 'thumbnails/originals/' + handle,
									public: false
								})
								.then(function () {
									console.log('%s uploaded to bucket %s.', filePath1, KUTZ_GALLERY_BUCKET + '/thumbnails/originails');
									gStorage
										.bucket(KUTZ_GALLERY_BUCKET)
										.upload(filePath2, {
											destination: 'thumbnails/cropped/' + handle,
											public: false
										})
										.then(function () {
											console.log('%s uploaded to bucket %s.', filePath2, KUTZ_GALLERY_BUCKET + '/thumbnails/cropped/');
											var sizeOf = Promise.denodeify(require('image-size'));
											sizeOf(filePath1).then(function (originalDimensions) {
												sizeOf(filePath2).then(function (croppedDimensions) {
													console.log('original dimensions are: %', originalDimensions);
													console.log('cropped dimensions are: %', croppedDimensions);
													res.status(200).send({
														fileHandle: handle,
														mimeType: mimeType,
														originalDimension: originalDimensions,
														croppedDimensions: croppedDimensions
													});
												}, function (err) {
													console.log('Error retrieving cropped image dimensions for %s', filePath2);
													res.status(200).send({
														fileHandle: handle,
														mimeType: mimeType,
														originalDimension: originalDimensions
													});
												});
											}, function (err) {
												console.log('Error retrieving original image dimensions for %s', filePath1);
												res.status(200).send({
													fileHandle: handle,
													mimeType: mimeType
												});
											});
										})
										.catch(function (err) {
											console.error('ERROR:', err);
											res.sendStatus(500);
										});
								})
								.catch(function (err) {
									console.error('ERROR:', err);
									res.sendStatus(500);
								});
						}
					});
			} else {
				console.log('File with handle %s already exists in cropped folder!', handle);
				res.sendStatus(500);
			}

		});
	} else {
		console.log('File with handle %s already exists in original folder!', handle);
		res.sendStatus(500);
	}
	/*gm(completeUrl).gravity('Center') // Move the starting point to the center of the image.
		.crop(width, height)
		.write('./tempFiles/' + imageCategory + '/' + handle, (err) => {
			if (err) {
				console.log(err);
			} else {
				response.sendFile('./tmp.png');
			}
		})*/
});


var mgmtData = {
	client_id: 'AWYl5Ml9rLcLIWD2rkouvNDyJmdFMeZJ',
	client_secret: 'IX19kW3te9RaZihtDMuS4fQJOw0E9pIThzEgE0Qkkqi67cJOTwZPVvOHUpoWhQzq',
	grant_type: 'client_credentials',
	audience: 'https://kuts-world.auth0.com/api/v2/'
};

app.post('/get-managementAPI-token', function (req, res) {

	console.log('\n/get-managementAPI-token API called!!!');
	request
		.post('https://kuts-world.auth0.com/oauth/token')
		.send(mgmtData)
		.end(function (err, payload) {
			if (err) {
				res.status(payload.status).send({
					message: 'Invalid credentials. Token not issued.'
				});
			} else {
				console.log(payload.body);
				res.status(200).send(payload.body);
			}
		});
});

app.post('/authenticate-firebase', function (req, res) {

	console.log('\n/authenticate-firebase API called!!!');
	if (!req.body.authID || Object.keys(req.body.authID).length === 0) {
		res.status(401).send('401 Required parameters missing. Please provide a auth id.');
	} else {
		var authID = req.body.authID;
		//var additionalInfo = {displayName : req.body.displayName, photoURL : req.body.photoURL};
		fireAdmin.auth().createCustomToken(authID)
			.then(function (customToken) {
				// Send token back to client
				console.log("\nReturning custom firebase authentication token: " + customToken.toString());
				res.status(200).send(customToken);
			})
			.catch(function (error) {
				console.log("Error creating custom token:", error);
				res.status(500).send(error)
			});
	}
});

var hasValidApiToken = function (tokenData) {
	var isValid = false;
	if (tokenData && tokenData.access_token && tokenData.expires_in) {
		isValid = (new Date().getTime() < (tokenData.expires_in * 1000) + new Date().getTime());
	}
	return isValid;
}

var getApiTokenFromServer = function (req, res, next) {
	console.log(apiTokenData);
	if (hasValidApiToken(apiTokenData)) {
		console.log('\nUsing the API token cached in the server...')
		return Promise.resolve({
			body: apiTokenData
		});
	} else {
		console.log('\nRetrieving a new API token from auth0...');
		return request
			.post(config.auth0.AUTH0_API_ACCESS_TOKEN_URL)
			.send(authData)
			.catch(function (error) {
				res.status(500).send(error.message)
			});
	}
}

var download = function (uri, filename, callback) {
	request.head(uri, function (err, res, body) {
		console.log('content-type:', res.headers['content-type']);
		console.log('content-length:', res.headers['content-length']);

		request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
	});
};

var makePath = function (pathArray) {
	if (Array.isArray(pathArray)) {
		var newPath = '.';
		for (var i = 0; i < pathArray.length; i++) {
			if (!fs.existsSync(newPath + '/' + pathArray[i])) {
				newPath += '/' + pathArray[i];
				fs.mkdirSync(newPath);
			}
		}
		console.log(newPath);
		return newPath;
	} else throw new Error('argument to makePath is not an array');
}

function isDirSync(aPath) {
	try {
		return fs.statSync(aPath).isDirectory();
	} catch (e) {
		if (e.code === 'ENOENT') {
			return false;
		} else {
			throw e;
		}
	}
}

/**
app.get('/console/user-submissions', getAccessToken, function (req, res) {
	console.log(req.body);
	request
		.get('http://localhost:7070/user-submissions')
		.set('Authorization', 'Bearer ' + req.access_token)
		.end(function (err, data) {
			console.log(data);
			if (data.status) {
				if (data.status == 403) {
					console.log(err);
					res.send(403, '403 Forbidden');
				} else if (data.status == 401) {
					res.send(401, '401 Forbidden');
				} else {
					var submissions = data.body;
					console.log(submissions);
					res.json(submissions);
				}
			} else {
				res.send(500, '500 Internal Error');
			}
		});
})
**/
console.log('Server running: http://localhost:9000');
server.listen(9000);

const express = require('express');
const redis = require('redis');
const cors = require('cors');

const app = express();
const API_PORT = process.env.PORT || 4000;
const REDIS_PORT = process.env.PORT || 6379;
app.use(cors());

app.get('/vote/:pet_type', async (request, response) => {
	const { pet_type } = request.params;
	const subscriber = redis.createClient({
		host: 'redis',
		port: REDIS_PORT,
	});
	const redis_client = redis.createClient({
		host: 'redis',
		port: REDIS_PORT,
	});
	await redis_client.incr(pet_type);

	await redis_client.get(pet_type, async (err, payload) => {
		if (err) {
			console.log('An error has occurred: ', err);
		}
		console.log(`Got payload ${payload}`);
		await redis_client.publish('VoteRegistered', payload);
	});
	subscriber.subscribe('VoteRegistered', async (err, data) => {
		if (err) {
			console.log('An error has occurred: ', err);
		}
		console.log('data from voteregistered ', data);
		await redis_client.get(pet_type, (err, payload) => {
			if (err) {
				console.log('An error has occurred: ', err);
			}
			response.status(200).send(payload);
		});
	});
});

app.delete('/reset', async (request, response) => {
	try {
		const redisClient = redis.createClient({
			host: 'redis',
			port: REDIS_PORT,
		});
		await redisClient.del('DOG');
		await redisClient.del('CAT');
		response.status(200).send('OK');
	} catch (error) {
		response.status(500).send(error);
	}
});

app.get('/load', async (request, response) => {
	const redisClient = redis.createClient({
		host: 'redis',
		port: REDIS_PORT,
	});
	redisClient.mget(['CAT', 'DOG'], (err, payload) => {
		if (err) {
			console.log('An error has occurred: ', err);
		}
		console.log(`Got ${payload} from getting cats and dogs on load`);
		response.status(200).send(payload);
	});
});

app.listen(API_PORT, () => {
	console.log(`REST Api running on ${API_PORT} port...`);
});

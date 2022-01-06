const { PubSub } = require('@google-cloud/pubsub');

require("dotenv").config();

const pubsub = new PubSub({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY
    }
});

// Publish message to PubSub
const publishPubSubMessage = async function(topicName, data) {
    const dataBuffer = Buffer.from(JSON.stringify(data));
    await pubsub.topic(topicName).publishMessage({ data: dataBuffer });
};

// Create my own topics
const createTopic = async function(topicName= "catalogue-topic") {
    try{
        await pubsub.createTopic(topicName);
        console.log(`Topic ${topicName} created`);
    }catch(e) {}
};

// Create my own subscriptions
// Example:  createSubscription("created-asset", "catalogue-service")
// Result: catalogue-service-created-asset
const createSubscription = async function(
    topicName ="topic-name", 
    subscriptionName="subscription-name") {
    
    // Create subscription
    try{
        await pubsub.topic(topicName).createSubscription(subscriptionName + "-" + topicName);

        console.log(`Subscription ${subscriptionName}-${topicName} created`);
    }catch(e) {}
}

module.exports = { publishPubSubMessage, createTopic, createSubscription };

const { PubSub } = require('@google-cloud/pubsub');
const { on } = require('nedb');
const { createSubscription } = require('./pubsub');

class Subscriptions {
    constructor() {
        this.PubSub = new PubSub({
            projectId: process.env.GOOGLE_PROJECT_ID,
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY
            }
        })
    }

    // Create my subscriptions
    initialize() {
        // Example subscription
        createSubscription("example-topic", "example-subscription").catch(console.error);
    }

    execute() {
        // Listen for new messages in this subscription
        this.PubSub
            .subscription("testing-topic")
            on("message", (message) => {
                // Example extracting data for the message
                console.log("Receiving...");
                const { your_variables } = JSON.parse(message.data.toString());

                // Specify how to use the message

                message.ack();
            });
    }

}

module.exports = Subscriptions;
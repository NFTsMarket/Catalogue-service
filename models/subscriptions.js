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
        // createSubscription("user-topic", "example-subscription").catch(console.error);
    }

    execute() {
        // On Created user
        this.PubSub
            .subscription("catalogue-created-user")
            .on("message", (message) => {
                // Example extracting data for the message
                console.log("Receiving...");
                console.log(JSON.parse(message.data.toString()));
                // const { your_variables } = JSON.parse(message.data.toString());
                
                // Specify how to use the message

                message.ack();
            });

            // On Updated user
            // Update all products from the user
            this.PubSub
            .subscription("catalogue-updated-user")
            .on("message", (message) => {
                // Example extracting data for the message
                console.log("Receiving...");
                console.log(JSON.parse(message.data.toString()));
                // const { your_variables } = JSON.parse(message.data.toString());

                // Specify how to use the message

                message.ack();
            });

            // On Deleted user
            // Update name, profile picture and email
            this.PubSub
            .subscription("catalogue-deleted-user")
            .on("message", (message) => {
                // Example extracting data for the message
                console.log("Receiving...");
                console.log(JSON.parse(message.data.toString()));
                // const { your_variables } = JSON.parse(message.data.toString());

                // Specify how to use the message

                message.ack();
            });
            
    }

}

module.exports = Subscriptions;
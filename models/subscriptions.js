const { PubSub } = require('@google-cloud/pubsub');
const { on } = require('nedb');
const { createSubscription } = require('./pubsub');
const User = require('../database/users')

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
                const user = JSON.parse(message.data.toString());
                console.log(user);
                User.create(user, async (err) => {});


                message.ack();
            });

            // On Updated user
            // Update all products from the user
            this.PubSub
            .subscription("catalogue-updated-user")
            .on("message", (message) => {
                // Example extracting data for the message
                console.log("Receiving...");
                // Where: only id; data: Information
                const { data, where } = JSON.parse(message.data.toString());
                var filter = { id: where.id };

                User.findOneAndUpdate(
                    filter,
                    data
                )

                console.log(where);
                console.log(data);
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
                
                const { id } = JSON.parse(message.data.toString());
                var filter = { id };

                User.findOneAndUpdate(
                    filter,
                    {deleted: true}
                )

                console.log(data);

                message.ack();
            });
            
    }

}

module.exports = Subscriptions;
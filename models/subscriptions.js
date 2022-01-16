const { PubSub } = require('@google-cloud/pubsub');
const { on } = require('nedb');
const { createSubscription, publishPubSubMessage } = require('./pubsub');
const User = require('../database/users')
const Asset = require('../database/assets')
const Product = require('../products')

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
        // createSubscription("created-asset", "catalogue").catch(console.error);
        // createSubscription("updated-asset", "catalogue").catch(console.error);
        // createSubscription("deleted-asset", "catalogue").catch(console.error);
    }

    execute() {

        // On create asset
        this.PubSub.subscription("catalogue-created-asset").on("message", async (message)=> {
            console.log("Receiving...");
            let asset = JSON.parse(message.data.toString());
            console.log(asset);

            try{
                asset = await Asset.create(asset);
                // Asset.create(asset, async (err) => {console.log(err)});
            }catch(e){
                console.log(e);
            }
            
            message.ack();
        })

        // On update asset
        this.PubSub.subscription("catalogue-updated-asset").on("message", async (message)=> {
            console.log("Receiving...");

            const asset = JSON.parse(message.data.toString());
            console.log(asset);
            let filter = { id: asset.id };
            
<<<<<<< Updated upstream
            await Asset.findOneAndUpdate(filter, asset)
=======
            try{
                await Asset.findOneAndUpdate(filter, asset, { new: true })
            }catch(e){
                console.log(e);
            }
>>>>>>> Stashed changes

            message.ack();
        })

        // On delete asset
        this.PubSub.subscription("catalogue-deleted-asset").on("message", async (message)=> {
            console.log("Receiving...");
            const asset = JSON.parse(message.data.toString());
            console.log(asset);

            // Delete asset in database
            const { id } = JSON.parse(message.data.toString());
            var filter = { id };

            try{
                await Asset.findOneAndUpdate(filter, { deleted: true});
            } catch(e){
                console.log(e);
            }
            
            // Delete product with Asset
            Product.findOneAndDelete({ picture: id})

            message.ack();
        })

        // On update purchase
        this.PubSub.subscription("catalogue-updated-purchase").on("message", async (message)=> {
            console.log("Receiving...");
            const purchase = JSON.parse(message.data.toString());
            const { productId, buyerId } = JSON.parse(message.data.toString());
            console.log(purchase);
            
            // Update product (owner)
            const updatedProduct = Product.findOneAndUpdate({ productId }, { owner: buyerId });
            console.log(updatedProduct);
            // Pub updated product (to uploads)
            // Update product (update by id)
            try {
                await publishPubSubMessage("updated-product", updatedProduct);
            } catch(e) {
                console.log(e);
            }

            message.ack();
        })

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

                message.ack();
            });
            
    }

}

module.exports = Subscriptions;
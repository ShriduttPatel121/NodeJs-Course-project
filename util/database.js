const mongodb = require('mongodb')
const MongodbClient = mongodb.MongoClient;

let _db;

const MongoConnect = (cb) => {
    MongodbClient.connect('mongodb+srv://ShriduttPatel:RYBxFXmrhLJxNDYG@node-shop-pgh1l.mongodb.net/shop?retryWrites=true&w=majority', { useUnifiedTopology: true })
    //{ useUnifiedTopology: true } is added due to this warning DeprecationWarning: current Server Discovery and Monitoring engine is deprecated, and will be removed in a future version. To use the new Server Discover and Monitoring engine, pass option { useUnifiedTopology: true } to the MongoClient constructor.
.then(client => {
    console.log('CONNECTED');
    _db = client.db();
    cb();
})
.catch(error => {
    console.log(error);
});
}

const getDb = () => {
    if(_db){
        return _db;
    }
    throw 'Could not connect to database';
}

exports.MongoConnect = MongoConnect;
exports.getDb = getDb; 


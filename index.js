const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hfrdj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("emaJhonProducts");
      const allProducts = database.collection("products");
      const allOrders = database.collection("orders");

      app.get('/products', async (req,res)=>{
          const query=req.query;
          const cursor= allProducts.find({});
          
          const count = await cursor.count();
          if(query.page){
            const result = await cursor.skip(parseInt(query.page)*10).limit(parseInt(query.size)).toArray();
            res.json({
                result,
                count,
            })
          }
          else{
            const result = await cursor.toArray();
            res.json({
                result,
                count,
            })
          } 
      })

      app.post("/products/keys", async(req,res)=>{
          const keys=req.body.keys;
          const query ={ key:{ $in:keys }}
          const result=await allProducts.find(query).toArray()
          res.json(result)
      })

      // stored user shipping details
      app.post("/shipping", async(req,res)=>{
        const orderData=req.body.data;
        const result= await allOrders.insertOne(orderData);
        res.json(result);
      })


     
    } 
    
    finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/', (req,res)=> {
    res.send('server connecting')
})

app.listen(port,()=>{
    console.log('server running')
})

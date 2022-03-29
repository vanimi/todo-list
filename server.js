// express webserver https://www.npmjs.com/package/express
// & HTTP body parsing middleware https://www.npmjs.com/package/body-parser
const express = require('express')
const bodyParser = require('body-parser')

// the official Node.js Cloudant library - https://www.npmjs.com/package/@ibm-cloud/cloudant
const { CloudantV1 } = require('@ibm-cloud/cloudant')
const client = CloudantV1.newInstance()
const DBNAME = "todo"

// constants
const PORT = 8080 // the default for Code Engine
const HOST = '0.0.0.0' // listen on all network interfaces


// the express app with:
// - static middleware serving out the 'public' directory as a static website
// - the HTTP body parsing middleware to handling POSTed HTTP bodies
const app = express()
app.use(express.static('public'))
app.use(bodyParser.json())

//does the db exist
// if it doesn't then 
// create db
// populate sample data
// create indexes 

//if it does exist, you don't need to do anything



// delete /todo/id
// get /todolist
// get /todolist/tag


// create new todo
app.post('/todo', async (req, res) => {
  // build the document to save to Cloudant
  const todo = req.body
  // Save the document in the database
  const response = await client.postDocument({
    db: DBNAME,
    document: todo
  })

  res.send(response)
})

app.get('/todolist', async (req, res) => {
  // get all todos in reverse chrono order
  const response = await client.postFind({
    db: DBNAME,
    selector: {},
    sort: [{
      timestamp: 'desc'
    }],
    limit: 50
  })
  console.log(response)
  res.send({
    "ok": true,
    response: response
  })
})

app.delete('/todo', async (req, res) => {
  // build the document to delete from Cloudant
  const todo = req.body
  // Save the document in the database
  await client.deleteDocument({
    db: DBNAME,
    docId: todo._id,
    rev: todo._rev
  })

  res.send({ "ok": true })
})




// start the webserver
app.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)


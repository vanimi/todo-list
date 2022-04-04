// check for environment variables
if (!process.env.CLOUDANT_URL || !process.env.CLOUDANT_APIKEY) {
  console.error('Please create CLOUDANT_URL & CLOUDANT_APIKEY environment variables before running. See README for details.')
  process.exit(1)
}

// express webserver https://www.npmjs.com/package/express
// & HTTP body parsing middleware https://www.npmjs.com/package/body-parser
const express = require('express')
const bodyParser = require('body-parser')

// the official Node.js Cloudant library - https://www.npmjs.com/package/@ibm-cloud/cloudant
const { CloudantV1 } = require('@ibm-cloud/cloudant')
const client = CloudantV1.newInstance()
const DBNAME = 'todo'

// constants
const PORT = 8080 // the default for Code Engine
const HOST = '0.0.0.0' // listen on all network interfaces

// the express app with:
// - static middleware serving out the 'public' directory as a static website
// - the HTTP body parsing middleware to handling POSTed HTTP bodies
const app = express()
app.use(express.static('public'))
app.use(bodyParser.json())

// POST /todo endpoint
app.post('/todo', async (req, res) => {
  console.log('POST /todo')
  // build the document to save to Cloudant
  const todo = req.body
  // Save the document in the database
  const response = await client.postDocument({
    db: DBNAME,
    document: todo
  })

  res.send(response)
})

// GET /todolist endpoint
app.get('/todolist', async (req, res) => {
  console.log('GET /todolist')
  // get all todos in reverse chrono order
  const response = await client.postFind({
    db: DBNAME,
    selector: {},
    sort: [{
      timestamp: 'desc'
    }],
    limit: 50
  })
  res.send({
    ok: true,
    response: response.result.docs
  })
})

app.get('/todolist/bytag', async (req, res) => {
  console.log('GET /todolist/bytag')
  // get all todos by tag in reverse chrono order
  const tag = req.query.tag
  const response = await client.postFind({
    db: DBNAME,
    selector: {tag:tag},
    sort: [{
      timestamp: 'desc'
    }],
    limit: 50
  })
  res.send({
    ok: true,
    response: response.result.docs
  })
})

// DELETE /todo endpoint
app.delete('/todo', async (req, res) => {
  console.log('DELETE /todo')
  // build the document to delete from Cloudant
  const todo = req.body
  // Save the document in the database
  await client.deleteDocument({
    db: DBNAME,
    docId: todo._id,
    rev: todo._rev
  })

  res.send({ ok: true })
})

const populateDb = async function () {
  // find out if the db exists and if not create it

  try {
    await client.getDatabaseInformation({db:DBNAME})
    //if you get here the db exists so do nothing
    console.log("Database exists")
    return
  } catch (error) {
    //if you end up here you need to create the db
    console.log("Database does not exist. Creating...")
  }
  try {
    await client.putDatabase({db:DBNAME})

    //now create the indexes
    await client.postIndex({
      db: DBNAME,
      ddoc: 'bydate-index',
      name: 'getTasksByDate',
      index: {fields:["timestamp"]},
      type: 'json'
    })

    await client.postIndex({
      db: DBNAME,
      ddoc: 'bytag-index',
      name: 'getTasksByTag',
      index: {fields:["tag", "timestamp"]},
      type: 'json'
    })

    //now add some sample data

    await client.postDocument({
      db:DBNAME,
      document: {
        title: "Buy Eggs",
        description: "They need to be Free Range",
        timestamp: new Date().toISOString(),
        tag: "shopping"
      }
    })
    await client.postDocument({
      db:DBNAME,
      document: {
        title: "Collect Children From School",
        description: "Remember there are three of them",
        timestamp: new Date().toISOString(),
        tag: "home"
      }
    })
    await client.postDocument({
      db:DBNAME,
      document: {
        title: "Buy Milk",
        description: "Soya and Oat Milk please",
        timestamp: new Date().toISOString(),
        tag: "shopping"
      }
    })
  } catch (error) {
    console.log("Failed to create database or indexes: ", error)
    return
  }
  
}

const main = async function () {

  await populateDb()

  // start the webserver
  app.listen(PORT, HOST)
  console.log(`Running on http://${HOST}:${PORT}`)
}

main()

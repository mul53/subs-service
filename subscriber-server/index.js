const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.set('port', 4000)
app.use(bodyParser.json())

app.post('/webhooks/wallets/balance/updates', (req, res) => {
    console.log(req.body)
    res.send({
        message: 'Success'
    })
})

app.listen(app.get('port'), () => {
    console.log(`Subscriber server listening on port ${app.get('port')}`)
})

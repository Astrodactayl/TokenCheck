//setup
const express = require("express"),
    app = express(),
    { post } = require("axios").default,
    path = require("path"),
    helmet = require("helmet"),
    expressip = require("express-ip"),
    port = process.env.PORT || 80

//plugins
app.use(helmet()) //secure
app.use(express.json()) //parse json
app.use(expressip().getIpInfoMiddleware) //ip
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public")) //static files

//main page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"))
})

//array initialization
const ipMap = []

//clear map every 15mins if its not already empty
setInterval(() => {
    if (ipMap.length > 0) {
        console.log(`Cleared map`)
        ipMap.length = 0
    }
}, 1000 * 60 * 15)

//check
app.post("/check", (req, res) => {
    //filter out bad requests
    if (!["sessionId", "uuid"].every(field => req.body[field])) return res.sendStatus(400)

    //ip ratelimiting
    if (!ipMap.find(entry => entry[0] == req.ipInfo.ip)) ipMap.push([req.ipInfo.ip, 1])
    else ipMap.forEach(entry => { if (entry[0] == req.ipInfo.ip) entry[1]++ })
    if (ipMap.find(entry => entry[0] == req.ipInfo.ip && entry[1] >= 5)) return res.sendStatus(429)

    //remove dashes from uuid
    req.body.uuid = req.body.uuid.replace(/-/g, "")

    //post and send response back to client
    post("https://sessionserver.mojang.com/session/minecraft/join", JSON.stringify({
        accessToken: req.body.sessionId,
        selectedProfile: req.body.uuid,
        serverId: req.body.uuid
    }), {
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => {
        if (response.status == 204) res.send(JSON.stringify({ text: "Valid ✔", color: "green" }))
    }).catch(err => {
        if (err.response.status == 403) res.send(JSON.stringify({ text: "Invalid ❌", color: "red" }))
        else res.send(JSON.stringify({ text: "Unknown ❓", color: "red" }))
    })
})

//create server
app.listen(port, () => console.log(`Listening at port ${port}`))

//vercel
module.exports = app
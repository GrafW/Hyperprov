var hyperprovclient = require("hyperprov-client")
var path = require('path');

//Switch to enable REST-api access or disable for CLI
var RESTAPI = true;

//Answer only local or external accesses to REST api
var localONLY = true;
var keypath = path.join(__dirname, 'hfc-key-store')
hyperprovclient.ccInit('Peer2', keypath, 'mychannel', 'myccds', 'node2.ptunstad.no:7051', 'node1.ptunstad.no:7050');
//hyperprovclient.ccJoin();

console.log("Starting in REST-api mode..")
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require("fs");
var listenaddress = '0.0.0.0'
if (localONLY == true){
    listenaddress = '127.0.0.1'
}

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/set', function (req, res) {
    var requestarguments = []
    if(req.headers['key']){
        var key = req.get('key').toString()
        requestarguments[0] = key
    }else{
        res.end("Too few arguments, requre header for key")
    }

    if(req.headers['value']){
        var value = req.get('value').toString()
        requestarguments[1] = value
    }else{
        res.end("Too few arguments, requre header for value")
    }

    if(req.headers['path']){
        var path = req.get('path').toString()
        requestarguments[2] = path
    }else{
        res.end("Too few arguments, requre header for path")
    }

    if(req.headers['pointer']){
        var pointer = req.get('pointer').toString()
        requestarguments[3] = pointer
    }else{
        res.end("Too few arguments, requre header for pointer")
    }

    if(req.headers['description']){
        var description = req.get('description').toString()
        requestarguments[4] = description
    }else{
        requestarguments[4] = ""
    }

    if(req.headers['dependencies']){
        var dependencies = req.get('dependencies').toString().split(", ")
        if(dependencies.length > 0){
            var concated = ""
            for (var d = 0; d < dependencies.length; d++) {
                console.log(dependencies[d])
                if (d != 0) {
                    concated = concated.concat(":");
                }
                concated = concated.concat(dependencies[d]);
            }
            console.log(concated)
            requestarguments[5] = concated
            console.log(requestarguments)
        }
    }
    
    hyperprovclient.ccPost('set', requestarguments, restCallback, null, res)
})
app.get('/get', function (req, res) {
    if(req.headers['key']){
        var key = req.get('key').toString()
    }else{
        res.end("Too few arguments, requre header for key")
    }
    hyperprovclient.ccGet('get', key, restCallback, res)
})
app.get('/getwithid', function (req, res) {
    if(req.headers['key']){
        var key = req.get('key').toString()
    }else{
        res.end("Too few arguments, requre header for key")
    }
    hyperprovclient.ccGet('getwithid', key, restCallback, res)
})
app.get('/getfromid', function (req, res) {
    if(req.headers['txid']){
        var txid = req.get('txid').toString()
    }else{
        res.end("Too few arguments, requre header for txid")
    }
    hyperprovclient.ccGet('getfromid', txid, restCallback, res)
})
app.get('/getkeyhistory', function (req, res) {
    if(req.headers['key']){
        var key = req.get('key').toString()
    }else{
        res.end("Too few arguments, requre header for key")
    }
    hyperprovclient.ccGet('getkeyhistory', key, restCallback, res)
})
app.get('/getdependencies', function (req, res) {
    var requestarguments = []
    if(req.headers['txid']){
        var txid = req.get('txid').toString()
        requestarguments[0] = txid
    }else{
        res.end("Too few arguments, requre header for txid")
    }
    if(req.headers['count']){
        var count = req.get('count').toString()
        requestarguments[1] = count
    }else{
        console.log("Count header not present, chaincode will use default depth")
    }
    hyperprovclient.ccGet('getdependencies', requestarguments, restCallback, res)
})
app.get('/getbyrange', function (req, res) {
    var requestarguments = []
    if(req.headers['startkey']){
        var startkey = req.get('startkey').toString()
        requestarguments[0] = startkey
    }else{
        res.end("Too few arguments, requre header for startkey")
    }
    var requestarguments = []
    if(req.headers['endkey']){
        var endkey = req.get('endkey').toString()
        requestarguments[1] = endkey
    }else{
        res.end("Too few arguments, requre header for endkey")
    }
    hyperprovclient.ccGet('getbyrange', requestarguments, restCallback, res)
})
app.post('/sendfile', function (req, res) {
    var requestarguments = req.get('arguments').toString()
    hyperprovclient.storeFile(requestarguments, res, req.body)
})
app.get('/getfile', function (req, res) {
    var requestarguments = req.get('arguments').toString()
    hyperprovclient.retrieveFile(requestarguments, res)
})

var server = app.listen(8080, listenaddress, function () {
var host = server.address().address
var port = server.address().port
console.log("Example app listening at http://%s:%s", host, port)
})


function restCallback(result, res){
    console.log("Result is : " + result)
    if (res){
        res.end(result)
    }
}


let express = require('express');
let bodyParser = require('body-parser');
let bcrypt = require('bcrypt');
let mongoose = require('mongoose');
let url = "mongodb://localhost:27017/iotbasic";
let app = express();
let port = 3000;

mongoose.connect(url,{
    useNewUrlParser: true,
    useFindAndModify: false
}).then(()=>{
    console.log("complete to connect database")
}).catch((err)=>{
    console.log("error to connect");
    process.exit();
});

var ModelSchema = mongoose.Schema({
    email: String,
    pass: String,
    deviceid: Array
});

var account = mongoose.model('useraccount',ModelSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/SignIn',(req,res) => {
    let email = req.body.email;
    let password = req.body.pass;
    let obj = {"email" : email};
    account.find(obj,async(err,result)=>{
        if(err) throw err;
        const validpass = await bcrypt.compare(password,result[0].pass);
        if(validpass){
            res.status(200).send({"message":"ok"});
        }
        else{
            res.status(404).send('Invalid Password');
        }
    });
});

app.post('/SignUp',async(req,res) =>{
    let email = req.body.email;
    let password = await bcrypt.hash(req.body.pass,10);
    let obj = {"email": email};
    account.find(obj,(err,result)=>{
        if(err) throw err;
        if(result[0] == undefined){
            let form = new account({email: email,pass: password,deviceid: []});
            form.save((err,data) =>{
                if(err) throw err;
                res.sendStatus(200);
            });
        }
        else{
            res.send("You have already account");
        }
    });
});

app.get('/QueryDevice',(req,res) =>{
    let email = req.query.email;
    let obj = {"email": email};
    account.find(obj,(err,result)=>{
        if(err) throw err;
        console.log(result[0].deviceid);
        res.sendStatus(200);
    });
});

app.put('/AddDevice',(req,res)=>{
    let email = req.query.email;
    let deviceid = req.query.deviceid;
    let obj = {"email" : email};
    var devicearray;
    account.find(obj,(err,result)=>{
        if(err) throw err;
        devicearray = result[0].deviceid;
        devicearray.push(deviceid);
        let device = {"deviceid" : devicearray};
        account.findOneAndUpdate(obj,device,(err)=>{
            if(err) throw err;
            res.sendStatus(200);
        });
    });
});

app.delete('/DeleteDevice',(req,res) =>{
    let email = req.query.email;
    let id = req.query.deviceid;
    let obj = {"email" : email};
    var devicearray;
    account.find(obj,(err,result)=>{
        if(err) throw err;
        console.log(id);
        devicearray = result[0].deviceid;
        console.log(devicearray);
        devicearray = devicearray.filter(item => item !== id);
        console.log(devicearray);
        let device = {"deviceid" : devicearray};
        account.findOneAndUpdate(obj,device,(err)=>{
            if(err) throw err;
            res.sendStatus(200);
        });
    });
});

app.listen(port,()=>{
    console.log(`Server run at http://localhost:${port}`);
});
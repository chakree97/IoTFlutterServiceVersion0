let express = require('express');
let bodyParser = require('body-parser');
let bcrypt = require('bcryptjs');
let mongoose = require('mongoose');
let url = "mongodb://localhost:27017/iotbasic";
let app = express();
let port = 3000;

mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(()=>{
    console.log("complete to connect database")
}).catch((err)=>{
    console.log("error to connect");
    process.exit();
});

var SensorData = mongoose.Schema({
    email: String,
    password : String,
    temp : Array,
    humidity: Array,
    DO1: Boolean,
    DO2: Boolean,
    DO3: Boolean,
    DO4: Boolean,
});

var data = mongoose.model('IoTData',SensorData);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/SignIn',(req,res) => {
    let email = req.body.email;
    let password = req.body.pass;
    let obj = {"email" : email};
    data.find(obj,async(err,result)=>{
        if(err) throw err;
        if(result.length == 0){
            res.status(404).send({"message":"None account"});
        }else{
            const validpass = await bcrypt.compare(password,result[0].password);
            if(validpass){
                res.status(200).send({"message":"verify"});
            }
            else{
                res.status(404).send({"message":"Invalid Password"});
            }
        }
    });
});

app.post('/SignUp',async(req,res) =>{
    let email = req.body.email;
    let password = await bcrypt.hash(req.body.pass,10);
    let obj = {"email": email};
    data.find(obj,(err,result)=>{
        if(err) throw err;
        if(result[0] == undefined){
            let form = new data({
                email: email,
                password: password,
                temp: [],
                humidity:[],
                DO1: false,
                DO2: false,
                DO3: false,
                DO4: false,
            });
            form.save((err,data) =>{
                if(err) throw err;
                res.status(200).send({"message":"verify"});
            });
        }
        else{
            res.status(200).send({"message":"You have already account"});
        }
    });
});

app.get('/getData',(req,res)=>{
    let email = req.query.email;
    let obj = {"email" : email};
    let temp = (Math.random()*25+25).toFixed(1);
    let humid = (Math.random()*25+50).toFixed(1);
    var tempArray,humidArray;
    data.find(obj,(err,result)=>{
        if(err) throw err;
        tempArray = result[0].temp;
        humidArray = result[0].humidity;
        tempArray.push(temp);
        humidArray.push(humid);
        let value = {"temp":tempArray,"humidity":humidArray};
        data.findOneAndUpdate(obj,value,(err)=>{
            if(err) throw err;
            let result = {"temp": temp,"humidity": humid};
            res.status(200).send(result);
        });
    });
});

app.get('/DoControl',(req,res)=>{
    let email = req.query.email;
    let DO1 = req.query.DO1;
    let DO2 = req.query.DO2;
    let DO3 = req.query.DO3;
    let DO4 = req.query.DO4;
    let obj = {"email" : email};
    data.find(obj,(err,result)=>{
        if(err) throw err;
        let value = {"DO1":DO1,"DO2":DO2,"DO3":DO3,"DO4":DO4};
        data.findOneAndUpdate(obj,value,(err)=>{
            if(err) throw err;
            res.status(200).send(value);
        });
    });
});

app.get('/getAllData',async(req,res)=>{
    let email = req.query.email;
    let obj = {"email" : email};
    data.find(obj,(err,result)=>{
        if(err) throw err;
        let value = {"temp":result[0].temp,"humidity":result[0].humidity};
        res.status(200).send(value);
    });
});

app.listen(port,()=>{
    console.log(`Server run at http://localhost:${port}`);
});
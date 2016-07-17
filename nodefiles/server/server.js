var express=require('express');
var bodyParser=require('body-parser');
var assert=require('assert');
var expressSession = require('express-session');
var path=require('path');
var cookieParser = require('cookie-parser'); 
var fs=require('fs');
var compiler=require('compilex');


var app=express();

app.use(cookieParser());

app.use(expressSession({secret:'1234567890'}));


app.use(bodyParser.urlencoded({
    extended: true
}));




var myfunctions=require('./myfunctions');

app.set('view engine', 'jade');

app.set('views',path.join(__dirname,'views'));




//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/onlineassignment';

var homeurl="http://localhost:8888";

app.use(express.static('../client'));

app.use(bodyParser.json());

var dbconn;

MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } 
  else 
  {
    //HURRAY!! We are connected. :)
    dbconn=db;
    console.log('Connection established to', url);
  }
  
});



process.on('SIGINT',function(){
dbconn.close();
console.log("successfully disconncected from the database");
process.exit();
});




app.get('/',function(req,res)
{
    res.sendfile(path.join(__dirname,"../","client/index.html"));
})


app.get('/insert-question',function(req,res)
{
    res.sendfile( path.join(__dirname,"../client" ,"/insertquestion.html"));
});




app.post('/insertquestion',function(req,res)
{
    var ptitle=req.body.problem_title;

    var pdesc=req.body.problem_desc;

    var given_input1=req.body.input1;

    var given_output1=req.body.output1;

    var given_input2=req.body.input2;

    var given_output2=req.body.output2;
    
    var pauthor=req.body.author;

    var total_questions;

    if(dbconn!=null)
    {
        
                    var questions_collection=dbconn.collection("questions");

                    var query={author:pauthor,title:ptitle,description:pdesc,input1:given_input1,output1:given_output1,input2:given_input2,output2:given_output2};
                        questions_collection.insert(query,function(err,result){
                                    
                                    if(err)
                                    {
                                        console.log("Error in inseting the problem into the database");

                                    }
                                    else
                                    {
                                        console.log("Question inserted into the data base successfully");
                                        //res.send("http://localhost:8888/compile/"+result[0]._id);
    
                                        res.redirect('/questions-list');

                                    }
                                });
       
    }

});






app.post('/fillcode',function(req,res)
{
    if(req.session.sid==null)
    {
        res.redirect(homeurl);
    }

    var sid=req.session.sid;



    var qid=req.body.qid;


    var filename=sid+"_"+qid+".cpp";

    var existed_code;

    fs.exists(path.join("Cfiles",sid,filename),function(exist){

        if(exist)
        {
            fs.readdir(path.join('Cfiles',sid),function(err,result){
                
                if(err) throw err;

                expected_code=fs.readFileSync("./Cfiles/"+sid+"/"+filename);

                res.send(expected_code);

            });
            
        }
    });


});







app.get('/compile',function(req,res)
{
    var qid=req.param('qid');



    if(qid==null)
    {
        qid="57881cf1134faf6b1426b2c8";
    }

    if(qid.indexOf('#')!=-1)
    {
        qid=qid.substring(0,qid.length-2);
    }


    if(req.session.sid==null)
    {
        res.redirect(homeurl);
    }

    var sid=req.session.id;

    
    
    qid=mongodb.ObjectID(qid);

        var questions_collections=dbconn.collection("questions");

        questions_collections.findOne({"_id":qid}, (function(err,result)
        {
            if(err) throw err;

            //res.send(result);
            var input1=result.input1;
            myfunctions.removeCReturn(input1,function(result_input1)
            {
                input1=result_input1;

                myfunctions.removeCReturn(result.output1,function(result_output1)
                {
                    var output1=result_output1;

                    res.render('compile',{arr:result,input:input1,output:output1,solhints:"",existed_code:""});
                    
                });
            });


            
        }));

});







app.post('/compileprog',function(req,res)
{

    if(req.session.sid==null)
    {
        res.redirect(homeurl);
    }
    var qid=req.body.qid;


    var given_sid=req.session.sid;

    var option = {stats : true,sid:req.session.sid,ques_no:qid};

    compiler.init(option);

    var code = req.body.code;

    var envData={OS : "linux" , cmd : "gcc",sid:given_sid,ques_no:qid,testcaseno:"1"};


    compiler.justCompileCPP(envData , code , function (data) {
            if(data.error)
            {
                res.send(data.error);
            }       
            else
            {
                res.send("Compilation Process Done Successfully");
            }
    
            });

});








app.get('/questions-list',function(req,res)
{
    var questions_collections=dbconn.collection("questions");

    var questions_arr;

    var url_list;

    var questions=questions_collections.find().toArray(function(err,arr_result)
    {
        if(err) throw err;

        res.render('questions-list',{questions: arr_result});
        /*
        for(var i=0;i<arr_result.length;i++)
        {
            url_list=url_list+"http:://localhost:8000/compile?qid="+arr_result[i]._id+"<br>";
        }

        res.send(url_list);
        */
        console.log(arr_result);
       
    });

    
});









app.post('/compilex',function(req,res)
{
    

    if(req.session.sid==null)
    {
        res.redirect(homeurl);
    }


    var qid=req.body.qid;

    var option = {stats : true,sid:req.session.sid,ques_no:qid};

    compiler.init(option);

    var code = req.body.code;
 

    var inputRadio = "true";

    var questions_collections=dbconn.collection("questions");

    var qidobject=mongodb.ObjectID(qid);

    var lang = "C";

    if(req.session.sid==null)
    {
        res.redirect(redirecturl);
    }

    var given_sid=req.session.sid;

    var str="";

    questions_collections.findOne({"_id":qidobject},function(err,result){

        if(err) throw err;
        var input1=result.input1;

        var output1;

        myfunctions.removeCReturn(result.output1,function(output)
            {
                output1=output;
                
                var envData1={OS : "linux" , cmd : "gcc",sid:given_sid,ques_no:qid,testcaseno:"1"};
                    
                    testingStart(input1,output1,envData1,function(result1){
                        
                        console.log(result1);   
                        if(result1=="passed")
                        {
                            
                            str="Test case 1 passed\n";
                        }
                        else
                        {
                            str="Test case 1 Failed\n";
                        }      

                    

                        var input2=result.input2;

                        var envData2={OS : "linux" , cmd : "gcc",sid:given_sid,ques_no:qid,testcaseno:"2"};

                        myfunctions.removeCReturn(result.output2,function(output2){


                            testingStart(input2,output2,envData2,function(result2)
                                {
                                        console.log(result2);
                                        
                                        if(result2=="passed")
                                        {
                                            str=str+"Test case 2 passed\n";

                                        }
                                        else
                                        {
                                            str=str+"Test case 2 Failed\n";
                                        }

                                        res.send(str);

                                });

                    });

        });

     });

        
        
        //var envData3={OS : "linux" , cmd : "gcc",sid:given_sid,ques_no:qid,testcaseno:"3"};

      });
    
    

    function testingStart(input,output,envData,fn){

    if((lang === "C") || (lang === "C++"))
    {        
        if(inputRadio === "true")
        {    

            compiler.compileCPPWithInput(envData , code ,input , function (data) {
                if(data.error)
                {
                    fn("compilation error");         
                }
                else
                {

                    
                    myfunctions.removeCReturn(data.output,function(obtained_result)
                    {
                       // assert.equal(obtained_result,output);
                       console.log("result:"+obtained_result);
                        console.log("expected:"+output)
                       myfunctions.compare(obtained_result,output);
                        if(obtained_result==output)
                        {
                            fn("passed");
                        }
                        else
                        {
                            fn("failed");
                        }
                    });

                    
                    //res.send(data.output);
                }
            });
       }
       else
       {
             
            compiler.compileCPP(envData , code , function (data) {
            if(data.error)
            {
                res.send(data.error);
            }       
            else
            {
                res.send(data.output);
            }
    
            });
       }
    }
}

});


app.post('/login',function(req,res){


	var cid=req.body.userid;
	var password=req.body.password;

    console.log(cid+" "+password);

    if(dbconn==null)
    {
        console.log("Error in connecting to database ");
        res.redirect(homeurl);
    }
	


    var student_collections=dbconn.collection("students");


    student_collections.findOne({"_id":cid},function(err,result){
    	
        if(err)
    	{
    		console.log("some error in getting the password from the database",err);
            res.send("Some error contact System Adminstrator");
    	}
    	else
    	{
            if(result!=null)
            {
                
    		      if(result.password==password)
    		          {
                             req.session.sid=cid;
                             console.log("valid credentials");
    			             //res.redirect(path.join(homeurl,'/compile'));
                             res.send("redirect");
    		          }
    		      else
    		          {
                             console.log("wrong password");
                             req.session.sid=null;
                             
                             res.send('invalid-password');

                             
    		          }
    		
            }
            else
            {
                console.log("No user exits");
                req.session.sid=null;
                
                res.send('invalid-user');

                //res.send("The username and password doesnot exits");
            }

        
    	}
    });

    //Close connection


});

app.listen(8888);


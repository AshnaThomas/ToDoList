const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set("view engine","ejs");

mongoose.connect("mongodb://localhost:27017/todolistDB");

const listItems = [];

const itemSchema = new mongoose.Schema({
  name:String
});

const Item = new mongoose.model("Item",itemSchema);

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema]
});

const List = mongoose.model("List",listSchema);

app.get("/", function(req,res){

  Item.find({},function(err,foundItems){
    if(err){
      console.log(err);
    }
    else{
      console.log("Successfully displyed items.");
    }

    res.render("todolist",
    {
      listTitle:"Today",
      newitems:foundItems
    });
  });
});



app.post("/",function(req,res){

  const itemName = req.body.addItem;
  const listName = req.body.list;

  const newItem = new Item({
    name:itemName
  });

  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      if(!err){
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/"+listName);
      }
    });
  }
});

app.post("/delete",function(req,res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItem,function(err){
      if(!err){
        console.log("Deleted checked items");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});


app.get("/:customListName",function(req,res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:customListName,
          items:listItems
        });

        list.save();

        res.redirect("/"+customListName);
      }
      else{
  
        res.render("todolist",
        {
          listTitle:foundList.name,
          newitems:foundList.items
        });
      }
    }
  });
});


app.listen(3000,function(req,res){
  console.log("Server running on port 3000");
});

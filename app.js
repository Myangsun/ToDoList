const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const day = date.getDate();
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");
const itemsSchema = new mongoose.Schema({
  name:String
});
const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];

const listSchema={
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/", (req, res) => {
  Item.find({},function(err,foundItems){

    if(foundItems.length == 0){
      Item.insertMany(defaultItems,(err)=>{
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved.");
        }
      });
      res.redirect("/");
    }else{
    res.render("list", {
      listTitle: day,
      items: foundItems
    });
  }
  });
});

app.get("/:customListName",(req, res)=>{
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},(err,foundList)=>{
    if(err){
      console.log(err);
    } else if (foundList){
      //Show an existing list
      res.render("list", {
        listTitle: foundList.name,
        items: foundList.items
      });
    } else{
      //Create a new list
      const list = new List({
        name:customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
  });
});

app.post("/", (req, res)=>{
  const itemName = req.body.newItem;
  const listName = req.body.button;

  const item = new Item({
    name:itemName
  });

  if(listName === day){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName},(err, foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete", (req, res)=>{
  const listName = req.body.listName;

  if(listName === day){
    Item.findByIdAndRemove(req.body.checkbox, (err)=>{
      if(err){
        console.log(err);
      }else{
        console.log("Successfully deleted.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:req.body.checkbox}}},(err, foundList)=>{
      if(err){
        console.log(err);
      }else{
        console.log("Successfully deleted.");
        res.redirect("/" + listName);
      }
    });
  }
});


app.get("/about", (req, res)=>{
  res.render("about");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Sever started on port 3000.")
});

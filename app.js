//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your ToDoList"
});

const item2 = new Item({
  name: "Press + button to add a new item"
});

const item3 = new Item({
  name: "<-- Click here to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems) {

    // if (foundItems.length === 0) {
    //   Item.insertMany(defaultItems)
    //     .then(function() {
    //       console.log("Default items added successfully");
    //     }).catch(function(err) {
    //       console.log(err);
    //     });
    //     res.redirect("/");
    // } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    // }
  }).catch(function(err) {
    console.log(err);
  });

app.get("/:listName", (req,res)=>{
    const listName = _.capitalize(req.params.listName);

    List.findOne({name:listName})
    .then(function(foundList){
      if(!foundList){
        // Create a new list
        const list = new List({
          name: listName,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+listName);

      } else {
        // Show an existing list
        res.render("list", {listTitle: listName, newListItems: foundList.items})
      }
    });

  })

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list.trim();

  const item = new Item({
    name: itemName
  });

if (listName === "Today"){
  item.save();
  res.redirect("/");
} else {
  List.findOne({name: listName})
  .then(function(foundList){
    foundList.items.push(item)
    foundList.save();
    res.redirect("/"+listName);
  }).catch(function(err){
    console.log(err);
  })
}


});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listNameDelete = req.body.listNameDelete;

  if(listNameDelete==="Today"){
    Item.findByIdAndRemove(checkedItemId)
    .catch((err)=>{
      console.log(err);
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listNameDelete}, {$pull: {items: {_id: checkedItemId}}})
    .then(function(foundList){
      res.redirect("/"+listNameDelete)
    }).catch((err)=>{
      console.log(err);
    });
  }

})



app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

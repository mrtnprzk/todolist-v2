//express
const express = require('express');
const app = express();
const port = 3000;
app.use(express.static("public")); //for loading css in folder public

//body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); //for selecting input attrubite name 

//ejs
const ejs = require('ejs');
app.set('view engine', 'ejs'); //for folder view

//lodash
const _ = require('lodash');

//mongoose
const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/todolistDB');
mongoose.connect('mongodb+srv://mrtnprzk:mrtnprzk@cluster0.coymc.mongodb.net/todolistDB');

    //Schema
    const itemSchema = new mongoose.Schema({name: String});

    const listSchema = new mongoose.Schema({
        name: String,
        items: [itemSchema]
    })

    //Model
    const Item = mongoose.model('Item', itemSchema);

    const List = mongoose.model('List', listSchema);

    //New Items
    const itemToDo = new Item ({
        name: "Welcome in To Do List"
    });

    const defaultItems = [itemToDo];

//routes -----------------------------------

app.get('/', (req, res) => {

    Item.find({}, function(err, foundItems) {

        if (foundItems.length === 0) {
            
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Succesfully inserted")
                }
            });
            res.redirect("/"); //if it is 0 then redirect and we will get to else

        } else {
            res.render('list', {listTitle: "Today", newListItems: foundItems});
        }
    });
});

app.get("/:customListName", (req, res) => {
    
    const customListName = req.params.customListName;

    List.findOne({name: customListName}, (err, result) => {
        if (!err) {
            if (!result) {
                const list = new List ({
                    name: customListName,
                    items: [defaultItems]
                });
                list.save()
                res.redirect(`/${customListName}`);
            } else {
                res.render('list', {listTitle: _.capitalize(result.name), newListItems: result.items});
            }
        }
    })
});
 
app.post('/', (req, res) => {

    //selecting tags with name = newItem
    const itemName = req.body.newItem; //input text
    const listName = req.body.list; //name of button ->getting value

    const item = new Item ({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, (err, result) => {
            result.items.push(item);
            result.save();
            res.redirect(`/${listName}`);
        });
    }
});

app.post('/delete', (req, res) => {

    const deleteItemId = req.body.deleteItem;
    const listName = req.body.listName;

    if (listName === "Today") {

        Item.findByIdAndDelete(deleteItemId, function (err) {
            if (err) {
                console.log(err)
            } else {
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteItemId}}}, (err, result) => {
            if (!err) {
                res.redirect(`/${listName}`);
            }
        })
    }  
});

app.get("/about", (req, res) => {
    res.render("about");
});

//---------------------------------------------

// heroku: process.env.PORT
let herokuPort = process.env.PORT;
if (herokuPort == null || herokuPort == "") {
    herokuPort = port
}

app.listen(herokuPort, () => {
    console.log(`Example app listening on port ${herokuPort}.`);
});
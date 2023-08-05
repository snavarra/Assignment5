/********************************************************************************* 
*  WEB700 – Assignment 5
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.   
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including web sites) or distributed to other students. 
*  
*  Name: Sherwin Navarra   Student ID: 121189229       Date: 2023-07-21
* 
********************************************************************************/ 
let express = require("express");
let HTTP_PORT = process.env.PORT || 8080;
let app = express();
let path = require("path");
let collegeData = require("./modules/collegeData");
const { countReset } = require("console");
app.use(express.urlencoded({ extended: true}));
const exphbs = require('express-handlebars');

app.use(express.urlencoded({extended: true}));

app.engine('hbs', exphbs.engine({ extname: '.hbs', defaultLayout: path.join(__dirname, 'views/layouts/main') }));
app.set('view engine', 'hbs');


app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
  });

const hbs = exphbs.create({
    helpers: {
      navLink: function(url, options) {
        return '<li' + ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
               '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
      },

      equal: function(lvalue, rvalue, options) {

      }
    }
});

  
app.engine('hbs', hbs.engine);  

collegeData.initialize()
    .then(() => {
        app.get('/', (req, res) => {
            res.render('home');
          });
        
        app.get('/students', (req, res) => {
            collegeData.getAllStudents()
              .then((data) => {
                res.render('students', { students: data });
              })
              .catch((err) => {
                res.render('students', { message: "no results" });
              });
          });

        app.get('/students/add', (req, res) => {
            res.render('addStudent');
          });

        app.post("/students/add", (req, res)=>{
            collegeData.addStudent(req.body)
            .then(()=>{
                res.redirect("/students")
            })
            .catch((error)=>{
                console.error(error)
                res.redirect('ERROR' + error);
            })
        })
        app.post("/students/update", (req, res) => {
          collegeData
            .updateStudent({ studentNum: parseInt(req.body.studentNum), ...req.body })
            .then((updatedStudent) => {
              res.redirect("/students");
            })
            .catch((error) => {
              console.error(error);
              res.redirect("/students");
            });
        });
        
        app.get("/tas", (req, res) => {
            collegeData.getTAs()
                .then((tas) => {
                    res.json(tas);
                })
                .catch((error) => {
                    res.status(404).json({ message: "no results" });
                });
        });
        
        app.get('/courses', (req, res) => {
            collegeData.getCourses()
              .then((data) => {
                res.render('courses', { courses: data });
              })
              .catch((err) => {
                res.render('courses', { message: "no results" });
              });
        });

        app.get('/courses/:id', (req, res) => {
            const courseId = req.params.id;
            collegeData.getCourseById(courseId)
              .then((course) => {
                res.render('course', { course });
              })
              .catch((err) => {
                res.render('course', { message: "no results" });
              });
        });
          
        
        app.get('/students/:studentNum', (req, res) => {
            const studentNum = parseInt(req.params.studentNum);
        
            collegeData.getStudentByNum(studentNum)
                .then((student) => {
                    res.render('student', { student });
                })
                .catch((err) => {
                    res.render('student', { message: "no results" });
                });
        });

        app.get("/theme.css", (req,res) => {
            res.sendFile(path.join(__dirname, "/css/theme.css"))
        });
        
        
        app.get('/about', (req, res) => {
            res.render('about');
          });
        
        app.get('/htmlDemo', (req, res) => {
            res.render('htmlDemo');
        });
        
        app.use((req, res) => {
            res.status(404).send("Page Not Found");
        });


        app.listen(HTTP_PORT, () => {
            console.log("Server listening on port: " + HTTP_PORT);
        });
    })
    .catch((error) => {
        console.error(error);
    });

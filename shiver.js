#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('node:fs');
const path = require('node:path');
const prompt = require("prompt-sync")({ sigint: true });
const { exec } = require('child_process');

const app_dir = __dirname

yargs(hideBin(process.argv))
  .command('init', 'generate shiver site', (yargs) => {
    return yargs;
  }, (argv) => {
    var dir = getSiteDirectory();
    var site_name = "Untitled";
    site_name = getSiteName();
    // console.log(`Site name is ${site_name}.`);
    if (argv.verbose) console.info(`Generating ...`);
    createSiteDirectory(dir, site_name, argv.verbose);
    runNpmInit(`${dir}/${site_name}`);
    process.chdir(`${dir}/${site_name}`);
    installExpress(`${dir}/${site_name}`);
    installEJS(`${dir}/${site_name}`);
    createViewsDirectories();
    createPublicDirectories();
    if (argv.single) {
      createSinglePageSite(undefined,undefined,true);
    }
    else {
      createMultiPageSite(true);
    }
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .option('single', {
    alias: 's',
    type: 'boolean',
    description: 'Generate single page site'
  })
  .command('add-about', 'add about page', (yargs) => {
    return yargs;
  }, (argv) => {
    createAboutPage();
    addPageToServer("about");
    addPageToRender("about");
  })
  .command('add-manifesto', 'add manifesto page', (yargs) => {
    return yargs;
  }, (argv) => {
    createManifestoPage();
    addPageToServer("manifesto");
    addPageToRender("manifesto");
  })
  .command('add-solutions', 'add solutions page', (yargs) => {
    return yargs;
  }, (argv) => {
    createSolutionsPage();
    addPageToServer("solutions");
    addPageToRender("solutions");
  })
  .command('add-contact', 'add contact page', (yargs) => {
    return yargs;
  }, (argv) => {
    createContactPage();
    addPageToServer("contact");
    addPageToRender("contact");
  })
  .command('launch', 'run shiver site', (yargs) => {
    return yargs;
  }, (argv) => {
    var dir = process.cwd(); // Get user's current directory
    runServer(dir);
  })
  .command('render', 'render shiver site as static files', (yargs) => {
    return yargs;
  }, (argv) => {
    var dir = process.cwd(); // Get user's current directory
    generateStaticFiles(dir);
  })
  .parse();

function createPage(filepath, html, headless = false, lang = "en"){
  var content = `<!DOCTYPE html>
<html lang="${lang}">
${html}
</html>`;
  if (headless){
    content = `${html}`;
  }
  fs.writeFile(filepath, content, err => {
    if (err) {
      console.error(err);
    } else {
      // file written successfully
    }
  });
}

function questionRegex(query, regex, error_msg){
  var retVal;
  try {
    retVal = prompt(`${query} `);
    if (regex.test(retVal)){
      throw error_msg;
    }
    return retVal;
  } catch (error) {
    console.error(error_msg);
    return questionRegex(query, regex, error_msg);
  }
}

function getSiteDirectory(){
  var site_dir, default_dir;
  site_dir = default_dir = process.cwd(); // Get user's current directory
  try {
    site_dir = prompt(`Enter site directory [${site_dir}]: `);
    if (site_dir == '') site_dir = default_dir;
    if (!fs.existsSync(site_dir)){
      throw `Directory not found.`;
    }
    return site_dir;
  } catch (error) {
    console.error(`Directory not found.`);
    return getSiteDirectory();
  }
}

function getSiteName(){
  var site_name;
  const regex = new RegExp('[^a-zA-Z0-9_\\-\\ ]');
  site_name = questionRegex(`Enter site name []:`, regex, `Entries must contain only alphanumeric characters, hyphens, and underscores.`);
  site_name = site_name.replace(/ /g, "_").toLowerCase();
  return site_name;
}

function createSiteDirectory(user_dir, site_name, verbose = false){
  try {
    if (verbose) console.log(`Creating "%s" ...`, path.resolve(`${user_dir}/${site_name}`));
    fs.mkdirSync(`${user_dir}/${site_name}`);
  } catch (error) {
    console.error(`Directory ${site_name} already exists.`);
  }
}

function runNpmInit(dir){
  exec('npm init -y', {cwd: dir}, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
  });
}

function createViewsDirectories(){
  try {
    fs.mkdirSync(`views`);
  } catch (error) {
    console.error(`Directory already exists.`);
  }
  try {
    fs.mkdirSync(`views/pages`);
  } catch (error) {
    console.error(`Directory already exists.`);
  }
  try {
    fs.mkdirSync(`views/partials`);
  } catch (error) {
    console.error(`Directory already exists.`);
  }
  try {
    fs.mkdirSync(`views/data`);
  } catch (error) {
    console.error(`Directory already exists.`);
  }
}

function createPublicDirectories(){
  try {
    fs.mkdirSync(`css`);
  } catch (error) {
    console.error(`Directory already exists.`);
  }
  try {
    fs.mkdirSync(`files`);
  } catch (error) {
    console.error(`Directory already exists.`);
  }
  // Copy favicon to images folder of site
  var watcher = fs.watch(process.cwd(), (eventType, filename) => { 
    if (eventType === 'rename' && filename === "images") {
      fs.cp(path.resolve(app_dir, "favicon.png"), path.resolve("images/favicon.png"), (err) => {
        watcher.close();
      });
    }
  });

  try {
    fs.mkdirSync(`images`);
  } catch (error) {
    console.error(`Directory already exists.`);
  }

  try {
    fs.mkdirSync(`js`);
  } catch (error) {
    console.error(`Directory already exists.`);
  }
}

function createSinglePageSite(additional_content = "", font_embed = false, header_img = false, menu = ""){
  var head = "";
  if (!font_embed){
    head = `<head>
    <%- include('../partials/head', {title:index_data.title, description:index_data.description}) %>
</head>`;
  } else {
    head = `<head>
    <%- include('../partials/head', {title:index_data.title, description:index_data.description}) %>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="<%= branding_data.tagline_font_embed %>" rel="stylesheet">
</head>`;
  }

  var header_img_section = `<div class="purpleblock">
<img id="header-img" src="<%= branding_data.header_img %>" alt="Picture of [User]" />
  <div class="pronouns">
    <span><%= index_data.pronouns %></span>
  </div>

  <div class="shortbio">
    <%= index_data.short_bio %>
  </div>
</div>`;
  if (!header_img) header_img_section = "";

  var content = `<div class="content">
  <%- include('../partials/header', {title:index_data.title}) %>

  ${header_img_section}

  <div class="bio">
    <%= index_data.long_bio %>
  </div>

  <div class="greenblock textblock">
    <p><em>They are changing the world.</em></p>
  </div>

${additional_content}

</div>`;
  var footer = `<%- include('../partials/footer') %>`;

  var poweredby = `<div class="poweredby">
  <div class="cardlink">
    <a href="https://bluesharkfriends.com/solutions"><span class="linkspan"></span></a>
    <div class="fitcontent"><p><small class="bytext">powered by</small><br /><em>Shiver</em><br /><small class="subtext">A website creation framework</small></p></div>
  </div>
</div>`;

  var body = `<body>

${content}
    
${footer}

${poweredby}
    
</body>`;

  var html = `${head}
  
${body}`;

  createPage("views/pages/index.ejs", html);

  createHeadPartial();

  const regex = new RegExp('[\\\\]');

  var full_site_name = questionRegex(`What is the full name of your site for the header?`, regex, `No backslashes.`);
  var tagline = ''; // questionRegex(`What is your site tagline?`, regex, `No backslashes.`);
  var tagline_font_embed = ''; // questionRegex(`What is the URL for the tagline's font embed?`, regex, `No backslashes.`);
  var icon_img = questionRegex(`What is the filename of your icon image?`, regex, `No backslashes.`);
  var header_img_filename = questionRegex(`What is the filename of your header image?`, regex, `No backslashes.`);
  var email = questionRegex(`What is the primary contact email for your site?`, regex, `No backslashes.`);
  var copyright_year = questionRegex(`What is the copyright year for your site content?`, regex, `No backslashes.`);
  var copyright_holder = questionRegex(`Who is the copyright holder for your site content?`, regex, `No backslashes.`);
  var facebook = questionRegex(`What is your Facebook URL?`, regex, `No backslashes.`);
  var linkedin = questionRegex(`What is your LinkedIn URL?`, regex, `No backslashes.`);
  var github = ''; // questionRegex(`What is your GitHub URL?`, regex, `No backslashes.`);
  var instagram = questionRegex(`What is your Instagram URL?`, regex, `No backslashes.`);

  createBrandingData(full_site_name, tagline, tagline_font_embed, icon_img, header_img_filename, email, copyright_year, copyright_holder, facebook, linkedin, github, instagram);
  
  var index_description = questionRegex(`What is the description for your index page?`, regex, `No backslashes.`);
  var pronouns = questionRegex(`What are your pronouns?`, regex, `No backslashes.`);
  var short_bio = questionRegex(`What is your short bio?`, regex, `No backslashes.`);
  var long_bio = questionRegex(`What is your long bio?`, regex, `No backslashes.`);

  createIndexData(index_description, pronouns, short_bio, long_bio);

  createStylesheet();

  createSiteJavascript();

  createHeaderPartial();

  createFooterPartial();

  createServerScript();

  createRenderScript();
}

function createSinglePageSiteWithConsultationButton(font_embed = false, header_img = false, menu = ""){
  var html = `<br /><br />

<div class="border" onclick="location.href='mailto:<%= branding_data.email %>';" style="cursor: pointer;">
  <a href="mailto:<%= branding_data.email %>">Schedule a consultation</a>
</div>`;
  createSinglePageSite(html, font_embed, header_img, menu);
}

function createMultiPageSite(font_embed = false, header_img = false){
  var menu = `<%- include('../partials/menu', {title:index_data.title}) %>`;
  createMenuPartial();
  createSinglePageSiteWithConsultationButton(font_embed, header_img, menu);
}

function createMenuPartial(){
  var html = `<div class="menu-icon"><a href="javascript:showHideMenu()">&#x2630;</a></div>
<% var page = typeof title != 'undefined' ? title : 'Untitled' %>
<div class="menu">
  <ul>
    <li><% if(page === "Home") { %>Home<% } else { %><a href="/">Home</a><% } %></li>
    <li><% if(page === "About") { %>About<% } else { %><a href="about">About</a><% } %></li>
    <li><% if(page === "Member Manifesto") { %>Manifesto<% } else { %><a href="manifesto">Manifesto</a><% } %></li>
    <li><% if(page === "Solutions") { %>Solutions<% } else { %><a href="solutions">Solutions</a><% } %></li>
    <li><% if(page === "Contact") { %>Contact<% } else { %><a href="contact">Contact</a><% } %></li>
  </ul>
</div>`;
  createPage("views/partials/menu.ejs", html, true);
}

function createHeadPartial(){
  var html = `<title><%= branding_data.full_site_name %> - <%= typeof title != 'undefined' ? title : 'Untitled' %></title>
<!--<link rel="shortcut icon" type="image/x-icon" href="images/<%= branding_data.icon_img %>" />-->
<link rel="shortcut icon" type="image/x-icon" href="images/favicon.png" />
<meta name="description" content="<%= typeof description != 'undefined' ? description : branding_data.full_site_name %>">
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="css/style.css">
<script type="text/javascript" src="js/site.js"></script>`;
  createPage("views/partials/head.ejs", html, true);
}

function createBrandingData(full_site_name, tagline, tagline_font_embed, icon_img, header_img, email, copyright_year, copyright_holder, facebook, linkedin, github, instagram){
  var json = `{
  "full_site_name": "${full_site_name}",
  "tagline": "${tagline}",
  "tagline_font_embed": "${tagline_font_embed}",
  "icon_img": "${icon_img}",
  "header_img": "${header_img}",
  "email": "${email}",
  "copyright_year": "${copyright_year}",
  "copyright_holder": "${copyright_holder}",
  "facebook": "${facebook}",
  "linkedin": "${linkedin}",
  "github": "${github}",
  "instagram": "${instagram}"
}`;
  createPage("views/data/_branding.json", json, true);
}

function createIndexData(description, pronouns, short_bio, long_bio){
  var json = `{
  "title": "Home",
  "description": "${description}",
  "pronouns": "${pronouns}",
  "short_bio": "${short_bio}",
  "long_bio": "${long_bio}"
}`;
  createPage("views/data/index.json", json, true);
}

function createStylesheet(){
  var css = `body {
  background-color: #0D1D2A;
  font-family: "Trebuchet MS", sans-serif;
  color: white;
  min-height: 97vh;
  display: flex;
  flex-direction: column;
  margin: 0;
}

.fitcontent {
  width:fit-content;
}

.poweredby {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: right;
}

.poweredby .cardlink {
  border: 2px solid #888888;
  border-radius: 30px;
  margin: 10px;
  padding: 2px;
  box-shadow: 2px 5px black;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  background-color: white;
  color: black;
}

.poweredby p {
  margin-top:10px;
  margin-bottom: 10px;
  text-align: left;
}

.poweredby .cardlink p {
  text-align: left;
}

.bytext {
  font-size:x-small;
  font-weight:bold;
}

.poweredby em {
  font-family: 'Trebuchet MS', sans-serif;
  font-weight: normal;
  font-style: normal;
}

.subtext {
  font-size:xx-small;
}

em {
  font-weight: bold;
  font-style: normal;
}

.preview_container {
  margin-top: 40px;
  text-align: left;
}

.preview em {
  font-weight: normal;
  font-style: italic;
}

.preview p {
  text-align: left !important;
}

h1 {
  margin-top: 21px;
}

h2 {
  margin-bottom: 20px;
}

a {
  color: #5BCEFA;
  text-decoration: none;
  font-weight: bold;
}

a:visited {
  color: #2B9EFA;
}

a:hover {
  color: #F5A9B8;
}

footer {
  margin-top: auto;
  text-align: center;
}

#header-img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  border-radius: 50%;
  object-fit: cover;
}

.border {
  border: 3px solid white;
  margin-top: 16px;
  margin-bottom: 16px;
  display: inline;
  padding: 10px;
}

.content {
  /*margin:0 auto;*/
  text-align: center;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.content h2 {
  text-align: left;
}

.content p {
  text-align: left;
  margin: 0;
}

.textblock {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.content > ul {
  display: inline-block;
  padding: 0;
  margin-top: 0;
  margin-bottom: 5px;
  list-style-type: none;
}

.content > ul > ul {
  list-style-type: none;
  padding: 0;
  padding-bottom: 10px;
  font-style: italic;
}

.shortbio {
  margin-top: 20px;
}

.bio {
  margin: auto;
  margin-top: 20px;
  padding: 10px;
  font-family: "Trebuchet MS", sans-serif;
  text-align: left;
}

.cardlink {
  position: relative;
  width: 200px;
  border: 2px solid #888888;
  border-radius: 30px;
  margin: 10px;
  padding: 30px;
  box-shadow: 5px 10px #dddddd;
}

.cardlink p {
  margin-top:10px;
  margin-bottom: 10px;
  text-align: center;
}

.cardlink:hover {
  cursor: pointer;
}

.cardlink:hover p {
  text-decoration: underline;
}

.linkspan {
  position:absolute; 
  width:100%;
  height:100%;
  top:0;
  left: 0;
  z-index: 1;
}

.imglinkbox {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: center;
}

.imglinkbox img {
  max-width: 200px;
}

.imglinkbox a {
  margin-bottom: 30px;
}

li {
  padding-bottom: 5px;
}

.book-title {
  font-style: italic;
}

p.inline {
  text-align: center;
}

.menu-icon {
  font-size: 2em;
  margin-left: 12px;
  width: fit-content;
  position: fixed;
}

.menu-icon a {
  color: black;
  font-weight: normal;
}

.menu-icon a:visited {
  color: black;
}

.menu-icon a:hover {
  color: black;
}

.menu {
  margin-left: -10px;
  margin-top: 50px;
  position:fixed;
  background-color: #0C0C40;
  padding-right: 20px;
  height: 100%;
  visibility: hidden;
}

.script-text {
  font-family: "Trebuchet MS", sans-serif;
  margin-top: 20px;
  margin-left: 30%;
}

.script-text p {
  text-align: left;
}

.border:hover a {
  color: #F5A9B8;
}

.about-img {
  float: left;
  padding-right: 10px;
}

.pronouns {
  margin-top: -1em;
  font-size: small;
  margin-left: 20%;
}

.pronouns span {
  display: inline-block;
  width: fit-content;
}

.manifesto div {
  text-align: left;
  padding-bottom: 10px;
}

.manifesto h3 {
  color: #dd526e;
  margin-bottom: 5px;
}

.manifesto p {
  text-align: left;
}

.manifesto b {
  color: #F5A9B8;
}

.license {
  font-size: small;
}

.purpleblock {
  background-color: #462E5B;
  padding: 20px;
  margin-bottom: 10px;
  color: white;
}

.greenblock {
  background-color: #4E5E5A;
  padding: 20px;
  margin-bottom: 10px;
  color: white;
}

.socialbox {
  display: flex;
  margin: auto;
  align-items: center;
  gap: 20px;
}

@media screen and (min-width: 800px) {
  #header-img {
    width: 38vh;
    height: 38vh;
  }

  .content {
    width: 100%;
  }
  .content p {
    width: 50%;
  }
  .bio {
    width: 50%;
  }
}

@media screen
  and (min-width: 320px)
  and (max-width: 800px) {
  #header-img {
    width: 42vw;
    height: 42vw;
  }
  .content {
    width: 100%;
  }
  .content p {
    width: 80%;
  }
  .script-text {
    margin-left: 10%;
  }
  .pronouns {
    margin-left: 50%;
  }
  .bio {
    width: 90%;
  }
}`;
  createPage("css/style.css", css, true);
}

function createSiteJavascript(){
  var js = `function showHideMenu()
{
    var menu = document.getElementsByClassName("menu")[0];
    if (menu.style.visibility === "visible")
    {
    menu.style.visibility = "hidden"
    }
    else
    {
    menu.style.visibility = "visible"
    }
}`;
  createPage("js/site.js", js, true);
}

function createHeaderPartial(){
  var html = `<h1><%= branding_data.full_site_name %></h1>
<% var page = typeof title != 'undefined' ? title : 'Untitled' %>
<% if(page === "Home") { %><% } else { %><h2 style="<% if(page === "About") { %>margin-top: 0;<% } %>"><%= typeof subheading != 'undefined' ? subheading : 'Untitled' %></h2><% } %>`;
  createPage("views/partials/header.ejs", html, true);
}

function createFooterPartial(){
  var html = `<footer>
<small>Copyright &copy; <%= branding_data.copyright_year %>, <%= branding_data.copyright_holder %>. All rights reserved.</small>
</footer>`;
  createPage("views/partials/footer.ejs", html, true);
}

function createServerScript(){
var js = `var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));

// use res.render to load up an ejs view file

let branding_data = require('./views/data/_branding.json')

// index page
let index_data = require('./views/data/index.json')
app.get('/', function(req, res) {
  res.render('pages/index', {index_data: index_data, branding_data: branding_data});
});

// end of pages

app.listen(8080);
console.log('Server is listening on port 8080');`;
  createPage("server.js", js, true);
}

function createRenderScript(){
  var js = `var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));

const fs = require('fs');

// use res.render to load up an ejs view file

let branding_data = require('./views/data/_branding.json')

// index page
let index_data = require('./views/data/index.json')
app.render('pages/index', {index_data: index_data, branding_data: branding_data}, (err, res) =>{
    if (err) {
        console.error('Error rendering');
    } else {
        console.log(__dirname + '/index.html')
        fs.writeFile(__dirname + '/index.html', res, err => {
            if (err) {
              console.error(err);
            } else {
              // file written successfully
            }
          });
    }
});

// end of pages

console.log('Static files generated.');`;
  createPage("render.js", js, true);
}

function installExpress(dir){
  exec('npm install express', {cwd: dir}, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
  });
}

function installEJS(dir){
  exec('npm install ejs', {cwd: dir}, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
  });
}

function runServer(dir){
  exec('node server.js', {cwd: dir}, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
  });
}

function generateStaticFiles(dir){
  exec('node render.js', {cwd: dir}, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
  });
}

function createAboutPage(){
  html = `<head>
  <%- include('../partials/head', {title:about_data.title, description:about_data.description}) %>
</head>
<body>
  <%- include('../partials/menu', {title:about_data.title}) %>

<div class="content" style="display: flex; flex-direction: column;">
  <%- include('../partials/header', {title:about_data.title, subheading: 'About'}) %>
<div>
  <% about_data.about_site.split("\\n").forEach(element => { %>
    <%= element %>
    <br />
  <% }); %>
</div>

<% about_data.people.forEach(member => { %>
  <div>
    <h3><%= member.name %></h3>
    <h4 class="pronouns"><%= member.pronouns %></h4>
    <img class="about-img" src="<%= member.img_src %>" width="200px" height="<% if(member.name === "Hannah Parker"){ %>267px<% } else{ %>201px<% } %>" alt="<%= member.img_alt %>"/>
    <div style="text-align: left;">
      <% if(member.name === "Hannah Parker"){ %>
        <%= member.bio %>
        <br /><br />
        <a href="<%= member.link_ref %>"><%= member.link_text %></a>
      <% } else { %>
        <% member.bio.split("\\n").forEach(element => { %>
          <%= element %>
          <br />
        <% }); %>
      <% } %>
    </div>
  </div>
<% }); %>
<br /><br />
</div>

<%- include('../partials/footer') %>

</body>`;
  createPage("views/pages/about.ejs", html);

  const regex = new RegExp('[\\\\]');

  var description = questionRegex(`What is the description for your about page?`, regex, `No backslashes.`);
  var about_site = questionRegex(`What is the about text for your site?`, regex, `No backslashes.`);

  var people = [];

  people = addPersonToAbout(people);

  createAboutData(description, about_site, people.toString());
}

function createAboutData(description, about_site, people){
  json = `{
    "title": "About",
    "description": "${description}",
    "about_site": "${about_site}",
    "people":
    [${people}]
}`;
  createPage("views/data/about.json", json, true);
}

function addPersonToAbout(people){
  const regex = new RegExp('[\\\\]');

  console.log("Generating individual data...");

  var name = questionRegex(`What is their name?`, regex, `No backslashes.`);
  var pronouns = questionRegex(`What are their pronouns?`, regex, `No backslashes.`);
  var bio = questionRegex(`What is their bio?`, regex, `No backslashes.`);
  var link_text = questionRegex(`What is their link text?`, regex, `No backslashes.`);
  var link_ref = questionRegex(`What is the URL for their link?`, regex, `No backslashes.`);
  var img_src = questionRegex(`What is the relative path to their image?`, regex, `No backslashes.`);
  var img_alt = questionRegex(`What is the alt text for their image?`, regex, `No backslashes.`);

  var profile = `{
    "name": "${name}",
    "pronouns": "${pronouns}",
    "bio": "${bio}",
    "link_text": "${link_text}",
    "link_ref": "${link_ref}",
    "img_src": "${img_src}",
    "img_alt": "${img_alt}"
}`;
  people.push(profile);

  var addPerson = prompt("Would you like to add another person? [no] ", "no");

  if (addPerson.toLowerCase() === "yes" || addPerson.toLowerCase() === "y"){
    addPersonToAbout(people);
  }
  return people;
}

function addPageToServer(name){
  var server = fs.readFileSync('server.js', 'utf-8');

  var updatedServer = server.replace("// end of pages", `// ${name} page
let ${name}_data = require('./views/data/${name}.json')
app.get('/${name}', function(req, res) {
  res.render('pages/${name}', {${name}_data: ${name}_data, branding_data: branding_data});
});

// end of pages`);

  fs.writeFileSync('server.js', updatedServer, 'utf-8');
}

function addPageToRender(name){
  var render = fs.readFileSync('render.js', 'utf-8');

  var updatedRender = render.replace("// end of pages", `// ${name} page
let ${name}_data = require('./views/data/${name}.json')
app.render('pages/${name}', {${name}_data: ${name}_data, branding_data: branding_data}, (err, res) =>{
    if (err) {
        console.error('Error rendering');
    } else {
        console.log(__dirname + '/${name}.html')
        fs.writeFile(__dirname + '/${name}.html', res, err => {
            if (err) {
              console.error(err);
            } else {
              // file written successfully
            }
          });
    }
});

// end of pages`);

  fs.writeFileSync('render.js', updatedRender, 'utf-8');
}

function createManifestoPage(){
  html = `<head>
  <%- include('../partials/head', {title:manifesto_data.title, description:manifesto_data.description}) %>
</head>
<body>
  <%- include('../partials/menu', {title:manifesto_data.title}) %>

<div class="content manifesto">
  <%- include('../partials/header', {title:manifesto_data.title, subheading: 'Member Manifesto'}) %>
  <div>
    <h3>
      1. Do not scale.
    </h3>
    <p>
      Our goal is to take care of our family and our community.  It is not our goal to build something that works for everyone.  We do not believe in building beyond the confines of mutual trust.
    </p>
  </div>
  <div>
    <h3>
      2. No one works for free.
    </h3>
    <p>
      All transactions are mutually beneficial exchanges either money, resources, or labor.  We are transparent about what we can offer and what we can accept.
    </p>
  </div>
  <div>
    <h3>
      3. Partner or consume; never employ.
    </h3>
    <p>
      We participate in this capitalistic system as a consumer by necessity.  But we will not enter into any hierarchical arrangements.  We believe in the equality of the worker.
    </p>
  </div>
  <div>
    <h3>
      4. No customers, just friends.
    </h3>
    <p>
      Business is a necessity for community.  But the alienation of the worker and the consumer is dehumanizing.  We seek to build personal relationships with all of our partners.  We are building a community.
    </p>
  </div>
  <div>
    <h3>
      5. Build coalitions not congregations.
    </h3>
    <p>
      Whenever possible we will empower people to carry endeavours in support of their own communities.  We do not acquire.  We arm.
    </p>
  </div>
  <div>
    <h3>
      6. No puritanical nonsense.
    </h3>
    <p>
      We play with legos.  We use plastic forks.  We will not apologize for trying to enjoy our lives.
    </p>
  </div>
  <div>
    <h3>
      7. Pay needs not salaries.
    </h3>
    <p>
      We take care of our members and their families.  Our thriving is our responsibility.  We share joy.
    </p>
  </div>
  <div>
    <h3>
      8. Practice liberation.
    </h3>
    <p>
      In an agrarian economy, collectivize the land.<br />
      In an industrial economy, collectivize the means of production.<br />
      In an information economy, collectivize the data.
    </p>
  </div>
  <div>
    <h3>
      9. Be publicly accountable.
    </h3>
    <p>
      We are not striving for perfection, we are striving for transparency and accountability to our community.  We will learn, grow, and evolve.
    </p>
  </div>
  <div>
    <h3>
      10. Strive to be moneyless.
    </h3>
    <p>
      Whenever possible, we will look to trade in mutual aid first when partnering with people in our community.  We want to direct our resources and our labor in service of our people, using the tool most mutually beneficial in context. Sometimes that will be money, but money relinquishes power to the currency owner. <b>We want to keep our power in our community as much as we can.</b>
    </p>
  </div>
  <div class="license">
    <hr />
    The Blue Shark Friends Member Manifesto is licensed under <a href="files/cnpl.pdf">CNPL7+</a> (<a href="https://thufie.lain.haus/NPL.html">summary</a>). Feel free to borrow and/or adapt for your own community!
  </div>
  <br />
</div>

  <%- include('../partials/footer') %>
  
</body>`;
  createPage("views/pages/manifesto.ejs", html);

  const regex = new RegExp('[\\\\]');

  var title = questionRegex(`What is the title for your manifesto page?`, regex, `No backslashes.`);
  var description = questionRegex(`What is the description for your manifesto page?`, regex, `No backslashes.`);

  createManifestoData(title, description);
}

function createManifestoData(title, description){
  json = `{
    "title": "${title}",
    "description": "${description}"
}`;
  createPage("views/data/manifesto.json", json, true);
}

function createSolutionsPage(){
  html = `<head>
  <%- include('../partials/head', {title:solutions_data.title, description:solutions_data.description}) %>
</head>
<body>
  <%- include('../partials/menu', {title:solutions_data.title}) %>

<div class="content">
  <%- include('../partials/header', {title:solutions_data.title, subheading: 'Software'}) %>
<ul>
  <li>Shiver</li>
    <ul>
      <li><small>Website content management system</small></li>
      <li><small><i>Not yet released</i></small></li>
    </ul>
</ul>

</div>

<%- include('../partials/footer') %>

</body>`;
  createPage("views/pages/solutions.ejs", html);

  const regex = new RegExp('[\\\\]');

  var description = questionRegex(`What is the description for your solutions page?`, regex, `No backslashes.`);

  createSolutionsData(description);
}

function createSolutionsData(description){
  json = `{
    "title": "Solutions",
    "description": "${description}"
}`;
  createPage("views/data/solutions.json", json, true);
}

function createContactPage(){
  html = `<head>
  <%- include('../partials/head', {title:contact_data.title, description:contact_data.description}) %>
</head>
<body>
  <%- include('../partials/menu', {title:contact_data.title}) %>

<div class="content">
  <%- include('../partials/header', {title:contact_data.title, subheading: 'Social Links'}) %>
<ul>
  <li><a href="<%= branding_data.facebook %>">Facebook</a></li>
  <li><a href="<%= branding_data.linkedin %>">LinkedIn</a></li>
  <li><a href="<%= branding_data.github %>">GitHub</a></li>
  <li><a href="<%= branding_data.instagram %>">Instagram</a></li>
</ul>

</div>

<%- include('../partials/footer') %>

</body>`;
  createPage("views/pages/contact.ejs", html);

  const regex = new RegExp('[\\\\]');

  var description = questionRegex(`What is the description for your contact page?`, regex, `No backslashes.`);

  createContactData(description);
}

function createContactData(description){
  json = `{
    "title": "Contact",
    "description": "${description}"
}`;
  createPage("views/data/contact.json", json, true);
}
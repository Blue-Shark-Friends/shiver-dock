#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('node:fs');
const prompt = require("prompt-sync")({ sigint: true });
const { exec } = require('child_process');

yargs(hideBin(process.argv))
  .command('init', 'generate shiver site', (yargs) => {
    return yargs;
  }, (argv) => {
    var dir = process.cwd(); // Get user's current directory
    var site_name = "Untitled";
    site_name = getSiteName();
    // console.log(`Site name is ${site_name}.`);
    if (argv.verbose) console.info(`Generating ...`);
    createSiteDirectory(dir, site_name);
    runNpmInit(`${dir}/${site_name}`);
    process.chdir(`${dir}/${site_name}`);
    installExpress(`${dir}/${site_name}`);
    installEJS(`${dir}/${site_name}`);
    createViewsDirectories();
    createPublicDirectories();
    createMultiPageSite(true);
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
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

function getSiteName(){
  var site_name;
  const regex = new RegExp('[^a-zA-Z0-9_\\-\\ ]');
  site_name = questionRegex(`What is the name of your site?`, regex, `Entries must contain only alphanumeric characters, hyphens, and underscores.`);
  site_name = site_name.replace(/ /g, "_").toLowerCase();
  return site_name;
}

function createSiteDirectory(user_dir, site_name){
  try {
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

  var header_img_section = `<img id="header-img" src="images/<%= branding_data.header_img %>" alt="Logo"/>`;
  var content = `<div class="content">
  <%- include('../partials/header', {title:index_data.title}) %>
<div class="script-text">
<p>
  <%- branding_data.tagline %>
</p>
</div>

${additional_content}

</div>`;
  var footer = `<%- include('../partials/footer') %>`;

  var body = "";
  if (!header_img){
    body = `<body>
${menu}

${content}
    
${footer}
    
</body>`;
  } else {
    body = `<body>
${header_img_section}

${menu}

${content}
    
${footer}

<div class="poweredby"><small>powered By shiver</small></div>
    
</body>`;
  }

  var html = `${head}
  
${body}`;

  createPage("views/pages/index.ejs", html);

  createHeadPartial();

  const regex = new RegExp('[\\\\]');

  var full_site_name = questionRegex(`What is the full name of your site for the header?`, regex, `No backslashes.`);
  var tagline = questionRegex(`What is your site tagline?`, regex, `No backslashes.`);
  var tagline_font_embed = questionRegex(`What is the URL for the tagline's font embed?`, regex, `No backslashes.`);
  var icon_img = questionRegex(`What is the filename of your icon image?`, regex, `No backslashes.`);
  var header_img_filename = questionRegex(`What is the filename of your header image?`, regex, `No backslashes.`);
  var email = questionRegex(`What is the primary contact email for your site?`, regex, `No backslashes.`);
  var copyright_year = questionRegex(`What is the copyright year for your site content?`, regex, `No backslashes.`);
  var copyright_holder = questionRegex(`Who is the copyright holder for your site content?`, regex, `No backslashes.`);
  var facebook = questionRegex(`What is your Facebook URL?`, regex, `No backslashes.`);
  var linkedin = questionRegex(`What is your LinkedIn URL?`, regex, `No backslashes.`);
  var github = questionRegex(`What is your GitHub URL?`, regex, `No backslashes.`);
  var instagram = questionRegex(`What is your Instagram URL?`, regex, `No backslashes.`);

  createBrandingData(full_site_name, tagline, tagline_font_embed, icon_img, header_img_filename, email, copyright_year, copyright_holder, facebook, linkedin, github, instagram);
  
  var index_description = questionRegex(`What is the description for your index page?`, regex, `No backslashes.`);

  createIndexData(index_description);

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

function createIndexData(description){
  var json = `{
  "title": "Home",
  "description": "${description}"
}`;
  createPage("views/data/index.json", json, true);
}

function createStylesheet(){
  var css = `body {
  background-color: #0C0C40;
  font-family: "Trebuchet MS", sans-serif;
  color: white;
  min-height: 97vh;
  display: flex;
  flex-direction: column;
}

em {
  font-weight: bold;
  font-style: normal;
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
  text-align: right;
}

#header-img {
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.border {
  border: 3px solid white;
  margin-top: 16px;
  margin-bottom: 16px;
  display: inline;
  padding: 10px;
}

.content {
  margin:0 auto;
  text-align: center;
}

.content p {
  text-align: center;
  text-shadow: 2px 2px black;
  margin: 0;
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
}

.menu-icon a {
  color: white;
  font-weight: normal;
}

.menu-icon a:visited {
  color: white;
}

.menu-icon a:hover {
  color: white;
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
  font-family: "Dancing Script", cursive;
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

.poweredby {
  text-align: left;
  position: fixed;
  bottom: 0;
  margin-left: -8px;
  font-size: x-small;
  padding-left: 5px;
  padding-bottom: 5px;
}

@media screen and (min-width: 800px) {
  #header-img {
    width: 25%;
    height: 25%;
  }

  .content {
    width: 50%;
  }
}

@media screen
  and (min-width: 320px)
  and (max-width: 800px) {
  #header-img {
    width: 50%;
    height: 50%;
  }

  .content {
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
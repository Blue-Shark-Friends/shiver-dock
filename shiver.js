#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('node:fs');
const prompt = require("prompt-sync")({ sigint: true });
const { exec } = require('child_process');

yargs(hideBin(process.argv))
  .command('init', 'generate a shiver site', (yargs) => {
    return yargs;
  }, (argv) => {
    var dir = process.cwd(); // Get user's current directory
    var site_name = "Untitled";
    site_name = getSiteName();
    // console.log(`Site name is ${site_name}.`);
    if (argv.verbose) console.info(`Generating ...`);
    createSiteDirectory(dir, site_name);
    runNpmInit(`${dir}/${site_name}`);
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .parse();

function createPage(){
  var content = `<!DOCTYPE html>
<html lang="en">
</html>`;
  fs.writeFile('test.html', content, err => {
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
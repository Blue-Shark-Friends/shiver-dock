#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('node:fs');
const prompt = require("prompt-sync")({ sigint: true });

yargs(hideBin(process.argv))
  .command('init', 'generate a shiver site', (yargs) => {
    return yargs;
  }, (argv) => {
    var dir = process.cwd(); // Get user's current directory
    var site_name = "Untitled";
    const regex = new RegExp('[^a-zA-Z0-9_\-]+$');
    site_name = questionRegex(`What is the name of your site?`, regex, `Entries must contain only alphanumeric characters, hyphens, and underscores.`);
    site_name = site_name.replace(/ /g, "_").toLowerCase();
    // console.log(`Site name is ${site_name}.`);
    if (argv.verbose) console.info(`Generating ...`);
    try {
      fs.mkdirSync(`${dir}/${site_name}`);
    } catch (error) {
      throw `Directory ${site_name} already exists.`
    }
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
    console.error(error)
    return questionRegex(query, regex, error_msg);
  }
}
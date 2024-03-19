#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const fs = require('node:fs')

yargs(hideBin(process.argv))
  .command('init', 'generate a shiver site', (yargs) => {
    return yargs
  }, (argv) => {
    if (argv.verbose) console.info(`Generating ...`)
    var content = `<!DOCTYPE html>
<html lang="en">
</html>`
    fs.writeFile('test.html', content, err => {
        if (err) {
          console.error(err);
        } else {
          // file written successfully
        }
      });
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .parse()
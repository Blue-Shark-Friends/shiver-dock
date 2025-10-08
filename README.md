# Shiver Dock

Shiver Dock is a Node.js package for generating and managing personal sites in a community web infrastructure.

## Pre-Installation

Shiver Dock requires Node.js 20.11.1 or greater. Below is a brief guide to installing Node.js. Node.js is supported on Windows, macOS, and Linux. You will need a PC to complete this process. If you have a Chromebook, you may need to complete additional steps to get it to work (not recommended for inexperienced users).

1. Navigate to [nodejs.org](https://nodejs.org/).

2. Click on the Download tab. Select your desired version from the drop-down. If you're not sure what to pick, use the latest LTS version.

3. **For non-technical users**: If you're using Windows or macOS, scroll down to the section labeled "Or get a prebuilt Node.js". Select your operating system, and click on the "Windows Installer (.msi)" or "macOS Installer (.pkg)" button. Save the installer to your preferred location. Double-click on it to launch and follow the instructions.

4. **For developers or administrators**: If you prefer not to use an installer package, there are commands provided at the top of the page. Select your operating system, preferred installer, and preferred package manager from the drop-downs. If you're unsure what installer to use, select nvm. It is not available on Windows, but we recommend checking out [nvm-windows](https://github.com/coreybutler/nvm-windows) as an alternative. If you decide to go this route, you will have to use the instructions there instead of the commands on nodejs.org. If you're unsure what package manager to use, select npm.

5. Once you have installed Node.js, you can verify that it and the package manager npm have installed correctly with the following commands:

```bash
# Verify the Node.js version:
node -v # Should print "v##.##.##".

# Verify npm version:
npm -v # Should print "##.##.##".
```

If you aren't familiar with command line interfaces, you can simply open the Command Prompt program on Windows or the Terminal app on macOS and copy the commands into the window. You may have to press Enter to run them. They should quickly respond with the version number you installed. If not, the install was not successful.

For more detailed installation instructions, refer to the [npm Docs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

If you need further assistance, you should check out the Node.js [Get Involved](https://nodejs.org/en/about/get-involved) page for more info on how to connect with the Node.js community.

## Installation

Shiver Dock is currently in alpha. This means that it has not been thoroughly tested and has not been prepared for wide use. When we are ready to issue a proper release, this process should be more accessible, but for the time being you will have to jump through some technical hoops if you would like to use it. Below is the current installation process.

1. Navigate to [shiver.bluesharkfriends.com](https://shiver.bluesharkfriends.com/).

2. Click the hamburger menu icon (☰) in the top-left corner of the page, and select "Tools" from the menu on the left.

3. Click the "Download latest release" button. Save the zip file to your preferred location.

4. Extract the contents of the zip file.

5. Open the command line and navigate to the Shiver Dock directory:

Windows

```bat
cd C:\Path\To\Your\Download\shiver-dock-0.0.1-alpha
```

macOS/Linux

```bash
cd /path/to/your/download/shiver-dock-0.0.1-alpha
```

6. Run `npm install`.

```bash
npm install
```

This should install all of Shiver Dock's dependencies.

7. **(Optional)** If you would like to use the `shiver` command directly, you will have to add it to your path. This has only been tested in Linux, but it should in theory work in any Unix-like operating system. It is not supported in Windows at this time. For a crash course on PATH on Linux systems, check out [What is $PATH on a Linux Shell? (The Linux Crash Course Series)](https://www.youtube.com/watch?v=hk0RwVC6uts) by Learn Linux TV. Skip to 13:23 if you're just interested in instructions on adding program directories to your path.

## Usage

If you configured the path under the optional step 7 of the Installation instructions, you should be able to run all commands like this: `shiver [command]`; otherwise you will have to call it with node like this: `node /path/to/shiver.js [command]` or `node C:\Path\To\shiver.js [command]`. The rest of these usage instructions will use `node shiver [command]` as a shorthand for this.

If Shiver Dock was installed correctly, this command should return a list of all commands:

```bash
node shiver help
```

If this doesn't work, make sure you have the right path to the shiver command.

For example, let's say you're on Windows, and you extracted `shiver-dock-0.0.1-alpha` in your Documents folder. Then your full command should look like this:

```bat
node C:\Users\username\Documents\shiver-dock-0.0.1-alpha\shiver help
```

If you're still experiencing issues, feel free to reach out to Blue Shark Friends at [info@bluesharkfriends.com](mailto:info@bluesharkfriends.com).

### Generating a single page site

To generate a single page site, you will need to use the `shiver init` command with the `-s` option. This stands for "**Shiver**, **init**ialize **s**ingle page site".

```bash
node shiver init -s
```

Shiver Dock will then prompt you with a series of questions.

```console
Enter site directory [/path/to/current/directory]:
Enter site name []: 
What is the full name of your site for the header?
What is the filename of your icon image?
What is the filename of your header image?
What is the primary contact email for your site?
What is the copyright year for your site content?
Who is the copyright holder for your site content?
What is your Facebook URL?
What is your LinkedIn URL?
What is your Instagram URL?
What is the description for your index page?
What are your pronouns?
What is your short bio?
What is your long bio?
```

If a value appears in square brackets (`[]`), that is the default value for that entry. In order to use the default, you can just hit Enter.

The site directory specifies where you want your site to be created.

If you use the blank default for site name, it will create the site in your site directory. Be careful with this, as it has not been thoroughly tested. The intended behavior is to input a site name, preferably lower case, with no spaces, using only alphanumeric characters (`A`-`Z`, `a`-`z`, `0`-`9`) and hyphens (`-`). Entries with capital letters will be converted to lower case, and entries with spaces will replace spaces with hyphens.

For all other questions, hitting Enter without entering any text will store an empty text string for that value. If you want to skip an entry and modify it manually later, that is a good way to do it.

The long bio question does not currently have a way to handle multi-line responses, so it is best to skip that one and enter it manually unless you're only entering a sentence or two for now.

Once you have answered all the questions, it should create a directory with your site name in the specified site directory. For example, if your name is Lilith Doe, your entries might look like this:

```console
Enter site directory [C:\Users\lilit\Documents]:
Enter site name []: lilithdoe
What is the full name of your site for the header? Lilith Doe
What is the filename of your icon image?
What is the filename of your header image?
What is the primary contact email for your site? lilith.doe@example.com
What is the copyright year for your site content? 2025
Who is the copyright holder for your site content? Lilith Doe
What is your Facebook URL? https://www.facebook.com/lilithdoe/
What is your LinkedIn URL? https://www.linkedin.com/in/lilith-doe/
What is your Instagram URL? https://www.instagram.com/lilithdoe/
What is the description for your index page? Lilith Doe's home page
What are your pronouns? she/her
What is your short bio? trans woman
What is your long bio?
```

At the end of this process, it would generate a directory at `C:\Users\lilit\Documents\lilithdoe`. You would then navigate to this directory to modify or run your site.

### Modifying your site

To use images on your site, place them in the `images` directory.

To modify the generated values, navigate to `views/data` and open `_branding.json` or `index.json` in your preferred text editor.

`_branding.json` stores the values that are used throughout the site and `index.json` stores the values that are used on your home page. In practice, that means everything from the full site name to the Instagram URL is stored in your `_branding.json` file and everything from description of your index page to long bio is stored in your `index.json` file.

If you're unfamiliar with JSON files, all you have to do is modify the values in double quotes (`""`) that follow the colon (`:`). For images, you'll need to specify the images directory and the full name of the image including its file format, like this `images/myimage.jpg`.

If you know HTML and would like to make further tweaks to your site, navigate to `views/pages` and open the `index.ejs` file. This file works just like an HTML file, except it can have additional EJS elements in it. EJS elements are in tags that look like this `<% %>`. If you don't know EJS, just don't touch those sections.

### Launching your site

If you are in your site's named directory, you can launch a local server to test your site by running `shiver launch`.

```bash
node shiver launch
```

However, we still recommend running the `server.js` file directly at this time.

```bash
node server.js
```

This should allow you to see any error messages that may pop up.

By default, your site will launch on port 8080. What this means is that all you have to do to view it after launch is navigate to `localhost:8080` in your web browser. This will only be visible to you. In order to launch on the Internet, you will need a server configured to host public sites. You can see a list of hosting options here: [shivernet.social/hosting](https://shivernet.social/hosting).

### Rendering your site as static pages

If you would like to host somewhere free like Neocities that supports static sites, you will have to render your site as static pages. In the current release, this should faithfully render your website as you would see it when you launch it, but in the future we will offer dynamic features that can't be rendered in this fashion, such as photo carousels that load photos directly from a database. If you wish to include these features in your site, static hosting may not be an option.

To render your site's pages, you can run `shiver render` from your site's named directory.

```bash
node shiver render
```

However, we still recommend running the `render.js` file directly at this time.

```bash
node render.js
```

This should allow you to see any error messages that may pop up.

After running, you should see `index.html` in your site's named directory. Upload your whole site's directory to your static host and it should run correctly. If you experience any issues, feel free to reach out to us at [info@bluesharkfriends.com](mailto:info@bluesharkfriends.com). 

## Contributing

If you would like to contribute, you are welcome to suggest changes or make error reports on [GitHub](https://github.com/Blue-Shark-Friends/shiver-dock) by navigating to the Issues tab and opening a new issue.

You can also make a fork of the project to try out your own changes. If we find a change useful to the community, we can open a pull request to incorporate your change.

For further discussion on Shivernet Toolkit products like Shiver Dock, check out our [GitHub Discussions page](https://github.com/orgs/Blue-Shark-Friends/discussions).

If you're interested in getting to know the Blue Shark Friends community, there are several ways to connect at [bluesharkfriends.com/connect](https://bluesharkfriends.com/connect).

## License

[GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.en.html)
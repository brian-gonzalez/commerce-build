

# Commerce Build process with Revolver

There are different scenarios covered by Revolver when working on a project with single or multiple store configurations. Revolver adapts to your setup depending on the parameters passed and which files are available.

## Multiple stores configurations with either a main or independent store cartridge(s):

Let’s say you have multiple stores and each has its own styles and own set of JS. To build the default store, all you need to run is:

    npm run [task]

To build a specific store or cartridge, run:

    npm run [task] --env.cartridge=cartridge_name

**Note: replace “`[task]`” with the task you want to run, such as `build` or `watch`.**  
  
  
Now let's say you need your "main_cartridge" to leverage almost all of the JS functionality from your "base_cartridge". However, you'd like to modify a few files in your "main_cartridge" without having to copy all of the source code from "base_cartridge". You can achieve this by setting the `revolverPath` property on your package.json to follow the priority you need:

    "scripts":  {
        [...]
    },
    "config":  {
        "cartridge": “main_cartridge”,
        "js": {
            "revolverPath": "main_cartridge, base_cartridge"
        }
    }

Then simply run:

    npm run [task]
  
  
This also works if you need to build a specific cartridge. Your `revolverPath` needs to include the extra cartridge:
    
    "revolverPath": "cartridge_name, main_cartridge, base_cartridge"

And then you can run:

    npm run [task] --env.cartridge=cartridge_name
  
  
You can override the `resolverPath` value at run time by passing it as a parameter:

    npm run [task] --env.revolverPath=third_cartridge,fourth_cartridge

You can run parallel builds by specifying a list of cartridges on the `cartridge` variable:

    npm run [task] --env.cartridge=main_cartridge,second_cartridge,third_cartridge

**Note: When running a command, use commas and no spaces between cartridge names. This is a limitation with Node.**  
  
Each cartridge must have at least one *app.js* file (inside the *js/* or *js/born/* directories, or both). Otherwise it means this cartridge is not meant to host built files, so the build will dump the files into the cartridge specified in `config.cartridge` instead.
  
  
## Single store with single or multiple locales:

Create a *style.scss* file inside the respective locale. If you have more than one locale, `@import` all the partials you need from the default or specific locale, then just replace those that are different for your current locale.

Run:

    npm run [task]

This assumes you've setup a default cartridge and an optional set of styles.inputPath and styles.outputPath (defaults to `"cartridges/{cartridge}/cartridge/scss/**/*.scss"` and `"cartridges/{cartridge}/cartridge/static/{subDirectory}/css/{outputFile}.css"` respectively) on your *package.json*

    "scripts":  {
        [...]
    },
    "config":  {
        "cartridge": “your_main_cartridge”,
        "styles": {
          "inputPath": "cartridges/{cartridge}/cartridge/scss/**/*.scss",
          "outputPath": "cartridges/{cartridge}/cartridge/static/{subDirectory}/css/{outputFile}.css"
        }
    },
    "devDependencies": {
        [...]
    }

### Styles object:
|Property|Description|
|--|--|
|`inputPath`|(optional) is the input path to your *.scss* files. The string uses a combination of interpolation and glob's magic patterns to determine the exact file that needs to be parsed. This property accepts a dynamic value for the `{cartridge}`.|    
|`outputPath`|(optional) is the output path of your built *.css* files. The string works similar to `styles.inputPath`, but in addition to having a `{cartridge}` dynamic value, you can also format your string using the `{subDirectory}` and `{outputFile}` values.|

### Styles object dynamic values:
|Value|Description|
|--|--|
|`{cartridge}`|It's value gets replaced with the cartridge name being processed during build time. For example, if you pass `--env.cartridge=your_main_cartridge,your_second_cartridge`, then the value of `{cartridge}` will become each of the specified cartridges| 
|`{subDirectory}`|It's value will be equal to the sub-directory found by the build when expanding the glob pattern in the  `styles.inputPath`, if any. For example, say your inputPath is `"cartridges/{cartridge}/cartridge/scss/**/*.scss"`, which then becomes `"cartridges/your_main_cartridge/cartridge/scss/en_US/main-styles.scss"`. In this example, the value of `{subDirectory}` will be "en_US". **Note:** Because CSS url references are relative to the file's location, built *.css* files will be placed in the specified output directory and will not carry their input sub-directory structure, other than the base `{subDirectory}`.|
|`{outputFile}`|It's value will be equal to the file name found by the build when expanding the glob pattern in the  `styles.inputPath`, if any. For example, say your inputPath is `"cartridges/{cartridge}/cartridge/scss/**/*.scss"`, which then becomes `"cartridges/your_main_cartridge/cartridge/scss/en_US/main-styles.scss"`. In this example, the value of `{subDirectory}` will be "main-styles".|

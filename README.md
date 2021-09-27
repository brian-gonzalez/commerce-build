# !BETA! Please do not use.



## Build Options & Settings

The build is setup in the main `config` property of your `package.json` file. The following example
showcases the minimum configurations needed, all other options are optional:

    //Not using Revolver:
    "config": {
        "rootFiles": true,
        "cartridge": "app_accelerator_core",
        "js": {
            "inputPath": "cartridges/{cartridge}/cartridge/client/default/js"
        },
        "styles": {
            "inputPath": "cartridges/{cartridge}/cartridge/client/**/*.scss",
            "aliasDirName": "scss"
        }
    }
    
    //Using Revolver:
    "config": {
        "rootFiles": true,
        "revolverPath": "plugin_instorepickup, plugin_giftcertificate, app_accelerator_core::core, app_storefront_base::base",
        "buildDisable": "app_storefront_base",
        "js": {
            "inputPath": "cartridges/{cartridge}/cartridge/client/default/js"
        },
        "styles": {
            "inputPath": "cartridges/{cartridge}/cartridge/client/**/*.scss",
            "aliasDirName": "scss"
        }
    }

The `js` and the `styles` properties shown above accept any of the available **Build API** options.
Use these to make configurations specifically for either JS or Style builds without affecting each
other.

## Build API

There are several options available for you to control how the build behaves.

|                      |          |                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Property Name**    | **Type** | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                              |
| rootFiles            | Boolean  | Default: `true`. Used for the JS build. Whether or not to parse and automatically build any JS files found at the root directory of the input path. This is necessary since SFRA expects files in that location to be built and placed into the equivalent `/static` directory.                                                                                                                                                              |
| revolverPath         | String   | Default: `plugin_instorepickup, plugin_giftcertificate, app_accelerator_core::core, app_storefront_base::base`. Specify one or more cartridges to use as a priority access and fallback system. Learn more about it in the "Understanding the revolverPath" section of this page.                                                                                                                                                            |
| buildDisable         | String   | Default: `app_storefront_base`. Specify one or more cartridge names you wish to skip the build on. This is important if you want to keep cartridges available for access from other cartridges, however you do not want to build those cartridges directly for one reason or the other.                                                                                                                                                      |
| inputPath            | String   | Default (JS): `cartridges/{cartridge}/cartridge/client/default/js` Default (Styles): `cartridges/{cartridge}/cartridge/client/**/*.scss`. Specify where your JS and CSS files are located. Usually both JS and CSS have different input paths, it is possible set separate configurations within the individual `js` and `styles` properties of the config object.                                                                           |
| outputPath           | String   | Default (JS): `cartridges/{cartridge}/cartridge/static/default/js` Default (Styles): `cartridges/{cartridge}/cartridge/static` Specify where you want your files to be compiled to after they're finished building. Usually both JS and CSS have different output paths, it is possible to set separate configurations within the individual `js` and `styles` properties of the `config` object in your package.json file.                  |
| mainFiles            | String   | Default: `main.js`.Specify one or more files to attach to your main entry object for Webpack. This option is largely unnecessary if you're setting `rootFiles:true`.                                                                                                                                                                                                                                                                         |
| mainEntryName        | String   | Default: `main`.Give a name to your main entry object for Webpack. This option is largely unnecessary if you're setting `rootFiles:true`.                                                                                                                                                                                                                                                                                                    |
| mainDirName          | String   | Default: `client`. Set the name of the directory that contains the general "client-side files", i.e. "js", "scss", and the locales.                                                                                                                                                                                                                                                                                                          |
| aliasDirName         | String   | Default: `scss`.Used for the Styles build only.Since Styles input paths can be more complex due to locale and subdirectory configurations, this property specified which is the "last directory before SCSS root".                                                                                                                                                                                                                           |
| keepOriginalLocation | Boolean  | Default: `false`. Used for the Styles build only. SFRA is not sensitive about including static assets using relative paths within CSS (i.e. url(../path/to/file.png)). When this options is set to `false` the build process flattens the CSS file tree structure so that relative paths can be used reliably.                                                                                                                               |
| useLocales           | Boolean  | Default: `true`. The build process can be used outside of SFRA. This flags allows working with file structures where there are no expected locale subdirectories.                                                                                                                                                                                                                                                                            |
| defaultLocale        | String   | Default: `default`. Specify the main locale for your site. Usually this does not need to be changed.                                                                                                                                                                                                                                                                                                                                         |
| includePaths         | String   | Used for the Styles build only. Specify one or more additional paths to add to SCSS' includePaths setting.                                                                                                                                                                                                                                                                                                                                   |
| clean                | Boolean  | Default: `false`. Deletes JS and CSS files found within the `/static` or output directories before starting a build.                                                                                                                                                                                                                                                                                                                         |
| js                   | Object   | It is possible to use any of the properties described in this API within this object. This allows to set options specifically for the JS build so that it doesn't affect the Styles build. For example, you may want to have separate inputPaths, or possibly even different revolverPaths entirely for your JS vs your Styles build. `"js": { "inputPath": "cartridges/{cartridge}/cartridge/client/default/js"}`                           |
| styles               | Object   | It is possible to use any of the properties described in this API within this object. This allows to set options specifically for the Styles build so that it doesn't affect the JS build.For example, you may want to have separate inputPaths, or possibly even different revolverPaths entirely for your Styles vs your JS build. `"styles": { "inputPath": "cartridges/{cartridge}/cartridge/client/**/*.scss", "aliasDirName": "scss"}` |

## Understanding the revolverPath

`revolverPath` provides an easy way to list your cartridges in the order in which they should
inherit from each other. It also makes it so that it is possible to access files from one cartridge
or the other using a simple syntax. If you're familiar with SFCC's Cartridge Path, then good news!
This works exactly the same way.

Given a revolverPath of the following structure:

`plugin_instorepickup, plugin_giftcertificate, app_accelerator_core, app_storefront_base`

We can interpret it the following way:

- The further to the left a cartridge appears in the path, the **higher up** in the chain they are.
- Conversely, the further to the right a cartridge is, the **lower down** the chain they are.

Put differently, you can also look at the `revolverPath` as if they were stacking or overlaying each
other:

1.  plugin_instorepickup
2.  plugin_giftcertificate
3.  app_accelerator_core::core
4.  app_storefront_base::base

This distinction is very important, because the **order in which the cartridges are listed matters**
for both Relative and Super imports.

**Note:** Always remember to organize your revolverPath in the order you want your cartridges to
overlay each other.

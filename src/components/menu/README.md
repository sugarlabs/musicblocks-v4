# Menu
The Menu is divided into 3 components following the MVVM Architecture:

 1. Model
 2. View
 3. View Model

## Menu Model
The Menu Model class following the IMenuModel interface, is defined in the Menu.ts file and stores the following:
#### Member variables:
| Parameter | Type | Description |
|--|--|--|
| _autoHide | boolean | Responsible for the auto-hide functionality of the menu dock. It is true if menu dock is not visible and auto-hide is on and vice-versa. |
| _autoHideTemp | boolean | Responsible for countering the change in _autoHide due to difference in z-indices of the menu overlay and the menu dock. |
| _playMenuVisible | boolean | Responsible for displaying the Play submenu on the menu dock. The Play submenu is visible if this is true and vice-versa. |
| _settingsMenuVisible | boolean | Responsible for displaying the Global Settings submenu on the menu dock. The Settings submenu is visible if itthisis true and vice-versa. |
| _projectMenuVisible | boolean | Responsible for displaying the Project submenu on the menu dock. The Project submenu is visible if this is true and vice-versa. |
| _languageMenuVisible | boolean | Responsible for displaying the Language Selection submenu displayed in the Settings submenu of the menu dock. The Language submenu is visible if this is true and vice-versa. |
| _blockSizeMenuVisible | boolean | Responsible for displaying the Adjust Block Size submenu displayed in the Settings submenu of the menu dock. The Block Size submenu is visible if this is true and vice-versa. |
| _musicSettingsMenuVisible | boolean | Responsible for displaying the Music Settings submenu on the menu dock. The Music Settings submenu is visible if this is true and vice-versa. |

All of the above defined member variables have their corresponding getter methodssince they have a private access modifier) and toggle methods, to toggle their state from true to false and vice-versa.

## Menu View Model

The View Model of the Menu is defined in the Menu.ts file. This file renders the Menu dock with all of the submenus and the wrapper overlay for the auto-hide functionality. All of the member variables defined the Menu Model are initialized in the View Model as a state with their corresponding set functions using the useState hook. In addition to the member variables of the Menu Model, the following are also defined in the Menu View Model:

| Paremeter | Type | Description |
|--|--|--|
| languages | string[] | List of languages to be displayed in the language submenu |
| blockSizes | IBlockSize[] | List of block sizes to be displayed in the block size submenu |
 
On the initial render of the Menu in the application, the languages[] and blockSizes[] are fetched from the Monitor which returns them from the Menu class as a Promise.

The following callback methods are defined in the view model to call their corresponding methods defined in the Monitor:

- play()
- playStepByStep()
- playSlowly()
- hideBlocks()
- cleanArtwork()
- collapseBlocks()
- undo()
- redo()

Each of the above method calls their couterparts defined in the Monitor. These are defined in the view model as follows:

``` js script
const  cleanArtwork  = (): void  => {
  Monitor.menu.cleanArtwork();
};
```

The toggle methods to update state of various variables of the Menu Model are also defined in the View Model:

- togglePlayMenu()
- toggleSettingsMenu()
- toggleProjectMenu()
- toggleLanguageMenu()
- toggleBlockSizeMenu()
- toggleMusicSettingsMenu()

These toggle functions switch the corresponding states from true to false and vice-versa, while also checking for any other open submenus. Thus, if any other submenu is already open, its visibility would be set to false while opening the current submenu. An example of how this is implemented is as follows:

``` js script
let toggleSettingsMenu  = () => {
    MenuModel.toggleSettingsMenu();
    setSettingsMenuVisible(MenuModel.settingsMenuVisible);
    
    // close any open submenu other than settings submenu
    if (!settingsMenuVisible) {
          if (playMenuVisible) {
            togglePlayMenu();
          }
          if (projectMenuVisible) {
            toggleProjectMenu();
          }
          if (languageMenuVisible) {
            toggleLanguageMenu();
          }
          if (blockSizeMenuVisible) {
            toggleBlockSizeMenu();
          }
          if (musicSettingsMenuVisible) {
            toggleMusicSettingsMenu();
          }
    }
};
```

Lastly, various methods for updating the Context Config from the Settings tab of the Menu are also defined:

| Method | Arguments | Argument Type |
|--|--|--|
| changeLanguage | language | string |
| updateHorizontalScroll | isEnabled | boolean |
| updateTurtleWrap | isWrapOn | boolean |
| changeBlockSize | blockSize | number |
| updateVolume | vol | number |

These methods call their counterparts in the Monitor which are initialized and registered in the App.tsx file wherein, the corresponding attribute of the Context Config is updated.

## Menu View

The Menu View consists of the Menu.tsx and Checkbox.tsx files along with their styles in the Menu.scss file. Checkbox is a custom component for a list item of Checkbox input and the title.

The structure of the Menu.tsx file is as follows:

![](../../../docs/images/menu-documentation/menu-view-structure.png)

The Menu dock is displayed if and only if the states autoHide and autoHideTemp are both not false at the same time.
This is ensured by the following code inside the menu-wrapper:

``` js script
<div
  className={ 
    props.autoHide  &&  props.autoHideTemp
    ?  'menu-dock  menu-dock-inactive'
    :  'menu-dock  menu-dock-active'
  }
>
```

Every button in the menu-dock has a corresponding tooltip, which is visible ony when its corresponding submenu is not visible(if any). It is defined by the following as an example:

``` js script
<span className={props.settingsMenuVisible ? 'inactive-menu' : ''}>Play</span>
```
#### The Play Submenu consists of the following options:

- Play
- Play Step by Step
- Play Slowly

#### The Project Submenu consists of the following options:

- Save Project
- Load Project
- New Project
- Merge Project

#### The Settings Submenu consists of the following options:

- Set Block Size
	- Small
	- Medium
	- Normal
	- Large
	- Very Large
- Language
	- English
	- português
	- 日本語
	- हिंदी
	- عربى
- Horizontal Scroll
- Turtle Wrap  

#### The Music Settings Submenu consists of the following options:

- Set Pitch
- Set Temperament
- Set Master Volume
- View Status


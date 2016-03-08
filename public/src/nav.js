/**
 * Nav is a responsive navigation that appears horizontally on Desktop and as a sideNav on mobile.
 *
 *
 *
 */

window.HugeNav = (function(){




    /**
     * Menu is the state holder for the navigation.  It dispatches events when states are changed.
     * 
     * selected:  Sets a main menu option (eg About, Careers, etc)  as selected, if it has sub-nodes.
     * openSidebarNav:  Opens and closes the sidebar nav
     * isHorizontal:  Used to set and determine whether the nav is horizontal or sidebar.
     * 
     */

    
    var menu = {
        currentSelection: null,
        horizontal: false,
        open: false,
        numChildren: 0,
        get selected() {
            return this.currentSelection;
        },
        set selected(x) {
            this.currentSelection = x;
            var event = new CustomEvent(
              'MENU_ITEM_SELECTED',
              {
                  detail: {
                      selected: x
                  }, bubbles: true, cancelable: false
              }
            );
            document.dispatchEvent(event);
        },
        get openSidebarNav(){
            return this.open;
        },
        set openSidebarNav(shouldOpen){
            this.open = shouldOpen;

            var event = new CustomEvent(
              'NAV_VERTICAL_STATE_CHANGE',
              {
                  detail: {
                      open: shouldOpen
                  }, bubbles: true, cancelable: false
              }
            );
            document.dispatchEvent(event);
        },
        get isHorizontal(){
            return this.horizontal;
        },
        set isHorizontal(test){
            this.horizontal = test;
            var event = new CustomEvent(
              'NAV_TRANSITION_CHANGE',
              {
                  detail: {
                      horizontal: this.horizontal
                  }, bubbles: true, cancelable: false
              }
            );
            document.dispatchEvent(event);


        }
    };


    /**
     * init()
     *
     * (called on load)
     *  Loads the data feed.
     *  Sets listener for responsive changes
     *  Builds the nav
     */


    function init(data) {
        var self = this;

        function widthChange(mq) {
            menu.isHorizontal = mq.matches;
        }

        self.menu.numChildren = data.items.length;

        self.createMenu(data.items);
        self.enableVerticalNavButtons();
        self.enableChangeListener();

        var widthCheck = window.matchMedia("(min-width: 768px)");
        widthCheck.addListener(widthChange);
        widthChange(widthCheck);

    }


    /**
     * enableChangeListener()
     *
     * listens for NAV_TRANSITION_CHANGE and configures the nav for horizontal & sidebar configs.
     */


    function enableChangeListener(){
        var nav = document.getElementById('main-navigation');
        document.addEventListener('NAV_TRANSITION_CHANGE', function(evt){

            if (evt.detail.horizontal){
                nav.classList.add('horizontal-nav');
                nav.classList.remove('vertical-nav');
            } else {
                nav.classList.add('vertical-nav');
                nav.classList.remove('horizontal-nav');
            }

            menu.selected = null;
            menu.openSidebarNav = false;
        });
    }


    /**
     * enableVerticalNavButtons()
     *
     * Enables the open/close functionality for the sidebar
     */


    function enableVerticalNavButtons(){
        var openBtn = document.getElementById('nav-button-open');
        if (openBtn){
            openBtn.addEventListener('click', function(){
                menu.openSidebarNav = true;
            });
        }

        var closeBtn = document.getElementById('nav-button-close');
        if (closeBtn){
            closeBtn.addEventListener('click', function(){
                menu.openSidebarNav = false;
            });
        }
    }

    /**
     * createMenu()
     *
     * @param data - json object to configure the menu
     *
     * Creates menu items and appends to DOM
     * Creates menu mask
     * Creates huge logo and appends as a li element
     * Creates and appends copyright code
     */


    function createMenu(data){
        var mainHeader = document.getElementById("main-navigation");

        if (!document.getElementById('huge-menu')){

            document.addEventListener('NAV_VERTICAL_STATE_CHANGE',function(evt){
                if (evt.detail.open){
                    mainHeader.classList.add('open');
                } else {
                    mainHeader.classList.remove('open');
                }
            });

            var menuContainer = document.createElement('div');
            menuContainer.id = 'huge-container';

            var menuList = document.createElement('ul');
            menuList.id = 'huge-menu';

            createMenuBackground();

            menuContainer.appendChild(menuList);
            mainHeader.appendChild(menuContainer);

            var logo = createLogo();
            menuList.appendChild(logo);

            data.map(function(menuItem){
                menuItem = createMenuItem(menuItem.label, menuItem.url, menuItem.items);
                menuList.appendChild(menuItem);
            });

            var copyright = createCopyright();
            menuContainer.appendChild(copyright);

        }
    }

    /**
     * createLogo()
     *
     * Creates HUGE logo
     * @returns {Element} logo
     */

    function createLogo(){
        var div  = document.createElement('div');
        div.style.paddingLeft = '24px';
        div.style.paddingRight = '48px';
        div.style.display = 'flex';
        div.style.alignItems = 'center';

        var img = document.createElement('img');
        img.src = 'images/HUGE-white.png';
        img.id = 'huge-logo';
        //img.height = 24;
        //img.width = 60;
        img.alt = 'Huge';

        div.appendChild(img);

        var menuItem = document.createElement('li');
        menuItem.classList.add('huge-menu-item');
        menuItem.appendChild(div);

        return menuItem;
    }


    /**
     * createMenuItem()
     *
     * @param label  - Menu copy
     * @param url  - Menu link
     * @param subItems - Array of sub menu items
     * @returns {Element} - menu item element
     *
     * Creates the menu item.
     * update() is invoked when MENU_ITEM_SELECTED is dispatched
     * eventHandler() handles menuItems mouse events
     */


    function createMenuItem(label, url, subItems){
        var menuItem = document.createElement('li');

        menuItem.classList.add('huge-menu-item');

        var link = createMenuLink(label, url, !subItems.length);
        if (subItems.length){
            var chevron = createChevron();
            link.appendChild(chevron);
        }
        menuItem.appendChild(link);
        menuItem.url = url;


        menuItem.update = function(evt){
            var self = menuItem;

            if (evt.detail.selected === self){
                // Menu was selected to open

                self.classList.add('open-menu');
                if (self.subMenu){
                    self.subMenu.classList.add('open-menu');
                }

            } else {
                // Menu was NOT selected to open

                self.classList.remove('open-menu');
                self.classList.remove('selected');

                if (self.subMenu) {
                    self.subMenu.classList.remove('open-menu');
                }
            }
        };

        menuItem.eventHandler = function(evt){
            var self = menuItem;

            switch (evt.type){
                case 'mouseover' :
                    self.classList.add('selected');
                    // Allows other menu items to open without a click exclusively in the horizontal nav
                    if (menu.selected  && menu.isHorizontal){
                        menu.selected = self;
                    }

                    break;

                case 'mouseout' :
                    if (menu.selected !== self || !menu.isHorizontal){
                        self.classList.remove('selected');
                    }
                    break;

                case 'click' :
                    if (subItems.length){
                        menu.selected = self;
                    } else {
                        menu.selected = null;
                        menu.openSidebarNav = false;
                        gotoLink(menuItem.url);
                    }
                    break;

            }
        };

        menuItem.addEventListener('click', menuItem.eventHandler);
        menuItem.addEventListener('mouseover', menuItem.eventHandler);
        menuItem.addEventListener('mouseout', menuItem.eventHandler);

        document.addEventListener('MENU_ITEM_SELECTED', menuItem.update);

        // Add and attach sub menu items
        if (subItems.length){
            var sub = createSubMenu(subItems);
            menuItem.appendChild(sub);
            menuItem.subMenu = sub;
            menuItem.numChildren = subItems.length;
        }

        return menuItem;

    }


    /**
     * createChevron()
     *
     * @returns {Element}  Chevron
     *
     * Creates chevron for sideNav
     */


    function createChevron(){
        var div  = document.createElement('div');
        div.classList.add('hide-desktop');
        div.classList.add('chevron');

        var img = document.createElement('img');
        img.src = 'images/chevron.svg';
        img.height = 48;
        img.width = 48;
        img.alt = 'open menu';

        div.appendChild(img);

        return div;
    }


    /**
     * createSubMenu()
     *
     * @param subData  json data defining the sub menu
     * @returns {Element} A 'ul' element contianing the subMenu
     *
     *
     */


    function createSubMenu(subData){
        if (subData.length){
            var subItemList = document.createElement('ul');
            subItemList.classList.add('huge-sub-menu');
            subData.map(function(subItemData){
                var subItem = createSubMenuItem(subItemData.label, subItemData.url);
                subItemList.appendChild(subItem);
            });
            return subItemList;
        }

    }


    /**
     * createSubMenuItem()
     *
     * @param label  - copy for the menuItem
     * @param url - link for the menuItem
     * @returns {Element} - submenu
     *
     * Builds element.
     * Attaches listeners for mouseover / click
     */


    function createSubMenuItem (label, url){
        var menuItem = document.createElement('li');
        menuItem.classList.add('huge-sub-menu-item');
        menuItem.url = url;

        var menuItemLink = createMenuLink(label, url, true);
        menuItem.appendChild(menuItemLink);
        menuItem.addEventListener('mouseover', function(){
            if (! menu.isHorizontal){
                event.stopPropagation();
            }
        });

        menuItem.addEventListener('click', function(){
            menu.openSidebarNav = false;
            menu.selected = null;
            event.stopPropagation();
            gotoLink(menuItem.url)
        });

        return menuItem;
    }


    /**
     * createMenuLink()
     *
     * @param label - Text label
     * @param url - Url
     * @param enableLink - Determines if it should be a div or anchor element
     * @returns {Element} An 'a' element with text/link attached
     *
     */


    function createMenuLink(label, url, enableLink){
        var e = enableLink ? 'a' : 'div';
        var mLink = document.createElement(e);
        mLink.classList.add('anchor');
        mLink.innerText = label;
        mLink.href = url;
        return mLink;
    }


    /**
     * createCopyright()
     *
     * @returns {Element} returns the copyright text for appending to the sideNav
     */
    function createCopyright(){
        var cr = document.createElement('div');
        cr.id = 'nav-copyright';
        cr.classList.add('hide-desktop');
        cr.classList.add('copyright');
        cr.innerText = '© 2014 Huge. All Rights Reserved.';
        return cr;
    }


    /**
     * createMenuBackground()
     *
     * Generates the dark mask that appears when menu options are being edited
     */


    function createMenuBackground (){
        var parent = document.getElementById('main-body');
        var bg = document.createElement('div');
        bg.classList.add('menu-background');

        bg.addEventListener('webkitTransitionEnd', function() {
            if (!bg.classList.contains('visible')){
                parent.removeChild(bg);
            }
        });

        bg.addEventListener('click', function(){
            menu.selected = null;
            menu.openSidebarNav = false;
        });



        bg.show = function(){
            parent.appendChild(bg);
            window.getComputedStyle(bg).height;
            bg.classList.add('visible');
        };

        bg.hide = function(){
            bg.classList.remove('visible');
        };



        document.addEventListener('MENU_ITEM_SELECTED', function(evt){
            if (evt.detail.selected){
                bg.show();
            } else {
                bg.hide();
            }
        });

        document.addEventListener('NAV_VERTICAL_STATE_CHANGE', function(evt){
            if (evt.detail.open){
                bg.show();
            } else {
                bg.hide();
            }
        });
    }


    /**
     * gotoLink()
     *
     * @param url
     *
     * Routes browser to target URL
     */


    function gotoLink(url) {
        window.location.href = url;
    }



    // Exposing private methods/properties for the sake of unit testing.

    return {
        menu: menu,

        init: init,
        createMenu: createMenu,
        createMenuItem: createMenuItem,
        createSubMenu: createSubMenu,
        createSubMenuItem: createSubMenuItem,
        enableChangeListener: enableChangeListener,
        enableVerticalNavButtons: enableVerticalNavButtons
    };


})();












/**
 * Returns a promise with the loaded data
 * @param url
 */
window.getJSON = function(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('get', url, true);
        xhr.responseType = 'json';
        xhr.onload = function () {
            var status = xhr.status;
            if (status == 200) {
                resolve(xhr.response);
            } else {
                reject(status);
            }
        };
        xhr.send();
    });
};


window.getJSON('/api/nav.json').then(function (data) {

    // Initiates the Nav
    window.HugeNav.init(data);


});





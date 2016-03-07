(function () {

    var menu = {
        currentSelection: null,
        horizontal: false,
        open: false,
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
        get openHorizontalNav(){
            return this.open;
        },
        set openHorizontalNav(shouldOpen){
            this.open = shouldOpen;
            //var shouldAnimate = animate || true;

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






    function init() {
        function getJSON(url) {
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
        }

        function widthChange(mq) {
            menu.isHorizontal = mq.matches;
        }

        getJSON('/api/nav.json').then(function (data) {
            createMenu(data.items);
            enableVerticalNavButtons();

            enableChangeListener();

            var widthCheck = window.matchMedia("(min-width: 768px)");
            widthCheck.addListener(widthChange);
            widthChange(widthCheck);


        }, function (status) {
            alert('Ruh-Roh: ' + status);
        });
    }

    function enableChangeListener(){
        console.log('setup');
        var nav = document.getElementById('main-navigation');
        document.addEventListener('NAV_TRANSITION_CHANGE', function(evt){
            console.log('change event');
            if (evt.detail.horizontal){
                nav.classList.add('horizontal-nav');
                nav.classList.remove('vertical-nav');
            } else {
                nav.classList.add('vertical-nav');
                nav.classList.remove('horizontal-nav');
            }
        });
    }

    function enableVerticalNavButtons(){
        var openBtn = document.getElementById('nav-button-open');
        if (openBtn){
            openBtn.addEventListener('click', function(){
                menu.openHorizontalNav = true;
            });
        }

        var closeBtn = document.getElementById('nav-button-close');
        if (closeBtn){
            closeBtn.addEventListener('click', function(){
                menu.openHorizontalNav = false;
            });
        }

    }


    function createMenu(data){
        var mainHeader = document.getElementById("main-navigation");

        if (!document.getElementById('huge-nav')){

            document.addEventListener('NAV_VERTICAL_STATE_CHANGE',function(evt){
                if (evt.detail.open){
                    mainHeader.classList.add('open');
                } else {
                    mainHeader.classList.remove('open');
                }
            });

            var menuList = document.createElement('ul');
            menuList.id = 'huge-menu';

            createMenuBackground();


            //hugeNav.appendChild(menuList);
            mainHeader.appendChild(menuList);

            var logo = createLogo();
            menuList.appendChild(logo);

            data.map(function(menuItem){
                menuItem = createMenuItem(menuItem.label, menuItem.url, menuItem.items);
                menuList.appendChild(menuItem);
            });
        }
    }

    function createLogo(){
        var div  = document.createElement('div');
        div.style.paddingLeft = '24px';
        div.style.paddingRight = '48px';
        div.style.display = 'flex';
        div.style.alignItems = 'center';

        var img = document.createElement('img');
        img.src = 'images/HUGE-white.png';
        img.height = 24;
        img.width = 60;
        img.alt = 'Huge';

        div.appendChild(img);

        var menuItem = document.createElement('li');
        menuItem.classList.add('huge-menu-item');
        menuItem.appendChild(div);

        return menuItem;
    }

    function createMenuItem(label, url, subItems){
        var menuItem = document.createElement('li');

        menuItem.classList.add('huge-menu-item');

        var link = createMenuLink(label, url);
        if (subItems.length){
            var chevron = createChevron();
            link.appendChild(chevron);
        }
        menuItem.appendChild(link);



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
                        menu.openHorizontalNav = false;
                    }
                    break;

            }
        };

        menuItem.addEventListener('click', menuItem.eventHandler);
        menuItem.addEventListener('mouseover', menuItem.eventHandler);
        menuItem.addEventListener('mouseout', menuItem.eventHandler);

        document.addEventListener('MENU_ITEM_SELECTED', menuItem.update);


        if (subItems.length){
            var sub = createSubMenu(subItems);
            menuItem.appendChild(sub);
            menuItem.subMenu = sub;
        }

        return menuItem;

    }

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

    function createSubMenuItem (label, url){
        var menuItem = document.createElement('li');
        menuItem.classList.add('huge-sub-menu-item');

        var menuItemLink = createMenuLink(label, url);
        menuItem.appendChild(menuItemLink);
        menuItem.addEventListener('mouseover', function(){
            if (! menu.isHorizontal){
                event.stopPropagation();
            }
        });

        menuItem.addEventListener('click', function(){
            menu.openHorizontalNav = false;
            menu.selected = null;
            event.stopPropagation();
        });

        return menuItem;
    }



    function createMenuLink(label, url){
        var mLink = document.createElement('a');
        mLink.innerText = label;
        mLink.href = url;
        return mLink;
    }



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
            menu.openHorizontalNav = false;
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





    init();


})();
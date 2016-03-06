var menu = {
    current: null,
    get selected() {
        return this.current;
    },
    set selected(x) {
        this.current = x;
        var event = new CustomEvent(
          "MENU_ITEM_SELECTED",
          {
              detail: {
                  selected: x
              },
              bubbles: true,
              cancelable: false
          }
        );
        document.dispatchEvent(event);
    }
};



function init(){

    var getJSON = function(url) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('get', url, true);
            xhr.responseType = 'json';
            xhr.onload = function() {
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

    getJSON('/api/nav.json').then(function(data) {
        createMenu(data.items);
    }, function(status) {
        alert('Ruh-Roh: ' + status);
    });
}


function createMenu(data){
    var mainHeader = document.getElementById("main-header");

    if (!document.getElementById('huge-menu')){


        var menuList = document.createElement('ul');
        menuList.id = 'huge-menu';
        mainHeader.appendChild(menuList);

        bg = createMenuBackground();
        if (mainHeader.nextSibling) {
            mainHeader.parentNode.insertBefore(bg, mainHeader.nextSibling);
        }
        else {
            mainHeader.parentNode.appendChild(bg);
        }

        data.map(function(menuItem){
            menuItem = createMenuItem(menuItem.label, menuItem.url, menuItem.items);
            menuList.appendChild(menuItem);
        });
    }
}

function createMenuItem(label, url, subItems){
    var menuItem = document.createElement('li');

    menuItem.classList.add('huge-menu-item');
    var link = createMenuLink(label);
    menuItem.appendChild(link);


    menuItem.update = function(evt){
        var self = menuItem;

        if (evt.detail.selected === self){
            self.classList.add('open-menu');
            if (self.subMenu){
                self.subMenu.classList.add('open-menu');
            }
        } else {
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
                if (menu.selected){
                    menu.selected = self;
                }

                break;

            case 'mouseout' :
                if (menu.selected !== self){
                    self.classList.remove('selected');
                }
                break;

            case 'click' :
                menu.selected = self;
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
    menuItem.linkURL = url;
    //menuItem.addEventListener('click', menuItemHandler);

    var menuItemLink = document.createElement('a');
    menuItemLink.innerText = label;
    menuItem.appendChild(menuItemLink);

    return menuItem;
}



function createMenuLink(label){
    var mLink = document.createElement('a');
    mLink.innerText = label;
    return mLink;
}



function createMenuBackground (){
    var bg = document.createElement('div');
    bg.classList.add('menu-background');

    bg.show = function(){
        bg.classList.add('visible');
    };

    bg.hide = function(){
        bg.classList.remove('visible');
    };

    bg.addEventListener('click', function(){
        menu.selected = null;
    });

    document.addEventListener('MENU_ITEM_SELECTED', function(evt){
        if (evt.detail.selected){
            bg.show();
        } else {
            bg.hide();
        }
    });
    return bg;
}





init();



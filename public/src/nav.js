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

var submenuItemHandler = function(evt){
    var btn = evt.target;

    switch (evt.type){
        case 'mouseover' :
            evt.target.classList.add('selected');
            break;

        case 'mouseout' :
            evt.target.classList.remove('selected');
            break;

        case 'click' :
            console.log('go to url');
            break;

    }
};

var menuItemHandler = function(evt){
    var btn = evt.target;

    switch (evt.type){
        case 'mouseover' :
            evt.target.classList.add('selected');
            break;

        case 'mouseout' :
            evt.target.classList.remove('selected');
            break;

        case 'click' :
            evt.target.classList.add('open-menu');
            evt.target.subMenu.classList.add('open-menu');
            break;

    }
};

var createSubMenuItem = function(label, url){
    var menuItem = document.createElement('li');
    menuItem.classList.add('huge-sub-menu-item');
    menuItem.addEventListener('click', submenuItemHandler);
    //menuItem.addEventListener('mouseover', submenuItemHandler);
    //menuItem.addEventListener('mouseout', submenuItemHandler);
    menuItem.innerText = label;
    menuItem.linkURL = url;
    return menuItem;
};

var createSubMenu = function(subData){
    if (subData.length){
        var subItemList = document.createElement('ul');
        subItemList.classList.add('huge-sub-menu');
        subData.map(function(subItemData){
            var subItem = createSubMenuItem(subItemData.label, subItemData.url);
            subItemList.appendChild(subItem);
        });
        return subItemList;
    }

};


var createMenuItem = function(label, url, subItems){
    var menuItem = document.createElement('li');
    menuItem.classList.add('huge-menu-item');
    menuItem.addEventListener('click', menuItemHandler);
    //menuItem.addEventListener('mouseover', menuItemHandler);
    //menuItem.addEventListener('mouseout', menuItemHandler);
    menuItem.innerText = label;

    if (subItems.length){
        var sub = createSubMenu(subItems);
        menuItem.appendChild(sub);
        menuItem.subMenu = sub;
    }

    return menuItem;

};


var createMenu = function(data){

    if (!document.getElementById('huge-menu')){
        var menuList = document.createElement('ul');
        menuList.id = 'huge-menu';
        document.getElementById("main-header").appendChild(menuList);

        data.map(function(menuItem){
            menuItem = createMenuItem(menuItem.label, menuItem.url, menuItem.items);
            menuList.appendChild(menuItem);
        });
    }









};

getJSON('/api/nav.json').then(function(data) {
    var menuArray = data;
    //console.log(data.items);
    createMenu(data.items);



}, function(status) { //error detection....
    console.log('Fail.');
    //alert('Something went wrong.');
});
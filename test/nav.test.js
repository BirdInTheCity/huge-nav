/*
 * Unit tests for src/nav.js
 */

// Short mock data
var json = {"items":[{"label":"Work","url":"#/work","items":[]},{"label":"About","url":"#/about","items":[{"label":"What we do","url":"#/about/what-we-do"},{"label":"How we work","url":"#/about/how-we-work"},{"label":"Leadership","url":"#/about/leadership"}]}]};


describe('Menu Object model', function() {


    it('Menu Object data gets/sets data', function() {
        var menu = window.HugeNav.menu;
        var testString = 'test';
        var falseValue = false;
        var trueValue = true;


        menu.selected = testString;
        expect(menu.currentSelection).toBe(testString);

        menu.openSidebarNav = trueValue;
        expect(menu.open).toBe(trueValue);

        menu.isHorizontal = falseValue;
        expect(menu.horizontal).toBe(falseValue);
    });

    it('Menu Object dispatches events', function() {
        var menu = window.HugeNav.menu;
        var testString = 'test';
        var falseValue = false;
        var trueValue = true;

        var selectedFired = null;
        var openSideBarFired = null;
        var horizontalFired = null;


        function e1Listener(e){
            selectedFired = e;
            expect(e.detail.selected).toBe(testString);
            document.removeEventListener('MENU_ITEM_SELECTED', e1Listener, false);
        }
        document.addEventListener('MENU_ITEM_SELECTED', e1Listener, false);

        menu.selected = testString;



        function e2Listener(e){
            openSideBarFired = e;
            expect(e.detail.open).toBe(trueValue);
            document.removeEventListener('NAV_VERTICAL_STATE_CHANGE', e2Listener, false);
        }
        document.addEventListener('NAV_VERTICAL_STATE_CHANGE', e2Listener, false);
        menu.openSidebarNav = trueValue;



        function e3Listener(e){
            horizontalFired = e;
            expect(e.detail.horizontal).toBe(falseValue);
            document.removeEventListener('NAV_TRANSITION_CHANGE', e3Listener, false);
        }
        document.addEventListener('NAV_TRANSITION_CHANGE', e3Listener, false);

        menu.isHorizontal = falseValue;
    });

});


describe('Nav initiates properly', function() {

    var nav = window.HugeNav;

    beforeEach(function(){
        spyOn(nav, 'init').and.callThrough();
        spyOn(nav, 'createMenu').and.stub();
        spyOn(nav, 'enableChangeListener').and.stub();
        spyOn(nav, 'enableVerticalNavButtons').and.stub();

        nav.init(json);
    });


    it('Enables Change Listener', function(){
        expect(nav.enableChangeListener).toHaveBeenCalled();
    });

    it('Enables Vertical Nav Buttons', function(){
        expect(nav.enableVerticalNavButtons).toHaveBeenCalled();
    });


    it('Enables Creates the Menu', function(){
        expect(nav.createMenu).toHaveBeenCalledWith(json.items);
    });
});

/*    TODO:  Cover remaining methods    */
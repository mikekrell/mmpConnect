Flowers = new Mongo.Collection("flowers");
Farms = new Mongo.Collection('farms');
Processors = new Mongo.Collection('processors');
Uploads = new Mongo.Collection('uploads');
Items = new Mongo.Collection('items');

Uploads.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function (userId, doc, fields, modifier) {
    return true
  }
});


if (Meteor.isClient) {

  Template.canvasModal.events({

    'click .modal-button': function(e, t) {
      AntiModals.dismissOverlay(e.target, null, null);
    },

    'click .change-sativa': function(e, t) {
      fabric.Canvas.activeInstance._objects[3].setFill("#da1e1e")
      fabric.Canvas.activeInstance.renderAll();
    },

    'click .change-indica': function(e, t) {
      fabric.Canvas.activeInstance._objects[3].setFill("#a319d0")
      fabric.Canvas.activeInstance.renderAll();
    },

    'click .change-hybrid': function(e, t) {
      fabric.Canvas.activeInstance._objects[3].setFill("#197b30")
      fabric.Canvas.activeInstance.renderAll();
    },

    'click .font-smaller': function(e, t) {
      var canvas = fabric.Canvas.activeInstance;
      var title = canvas._activeObject;

      title.setFontSize(title.fontSize - 4)
      var pos = {x: 615 / 2  , y: title.top};

      title.setPositionByOrigin(pos, 'middle', 'top');
      canvas.renderAll();
    },

    'click .font-larger': function(e, t) {
      var canvas = fabric.Canvas.activeInstance;
      var title = canvas._activeObject;

      title.setFontSize(title.fontSize + 4)
      var pos = {x: 615 / 2  , y: title.top};

      title.setPositionByOrigin(pos, 'middle', 'top');

      canvas.renderAll();
    }



  })

  var fileWaiting = false;
  var uploadedFile = ''

  function fileUploaded(reset, fileInfo) {
    if (reset === false) {
      fileWaiting = true;
      uploadedFile = fileInfo;
    }else {
      fileWaiting = false;
      uploadedFile = ''
    }
  }

  Uploader.finished = function(index, fileInfo, templateContext) {

    fileUploaded(false, fileInfo)

    Uploads.insert(fileInfo);

  }

  angular.module('oregonsFinest',['angular-meteor','ngMaterial', 'ui.router', "angularGrid"]);

  angular.module("oregonsFinest").config(['$urlRouterProvider', '$stateProvider', '$locationProvider', '$mdThemingProvider',
    function($urlRouterProvider, $stateProvider, $locationProvider, $mdThemingProvider){

      $locationProvider.html5Mode(true);

      $stateProvider
        .state('flowers', {
          url: '/flowers',
          templateUrl: 'flowers-list.ng.html',
          controller: 'FlowersListCtrl'
        })
        .state('flowerCreate', {
          url: '/flowers/create',
          templateUrl: 'flower-create.ng.html',
          controller: 'FlowerCreateCtrl'
        })
        .state('flowerEdit', {
          url: '/flowers/edit/:id',
          templateUrl: 'flower-edit.ng.html',
          controller: 'FlowerDetailsCtrl'
        })
        .state('farms', {
          url: '/farms',
          templateUrl: 'farms-list.ng.html',
          controller: 'FarmsListCtrl'
        })
        .state('farmCreate', {
          url: '/farms/create',
          templateUrl: 'farm-create.ng.html',

          controller: 'FarmCreateCtrl'
        })
        .state('farmEdit', {
          url: '/farms/edit/:id',
          templateUrl: 'farm-edit.ng.html',
          controller: 'FarmDetailsCtrl'
        });

      $urlRouterProvider.otherwise("/flowers");

      $mdThemingProvider.theme('docs-dark', 'default')
        .primaryPalette('yellow')
        .dark();

    }]);

  angular.module("oregonsFinest").controller("AppCtrl", ['$scope', '$meteor', '$timeout', '$mdSidenav', '$mdUtil', '$log',
    function($scope, $meteor, $timeout, $mdSidenav, $mdUtil, $log){
      $scope.toggleLeft = buildToggler('left');
      $scope.toggleRight = buildToggler('right');
      /**
       * Build handler to open/close a SideNav; when animation finishes
       * report completion in console
       */
      function buildToggler(navID) {
        var debounceFn =  $mdUtil.debounce(function(){
              $mdSidenav(navID)
                .toggle()
                .then(function () {
                  $log.debug("toggle " + navID + " is done");
                });
            },300);
        return debounceFn;
      }

      $scope.test = function () {
        alert('test')
      }
    }]);

  angular.module("oregonsFinest").controller("FlowersListCtrl", ['$scope', '$meteor',
    function($scope, $meteor){

      $scope.flowers = $meteor.collection(Flowers);

      $scope.remove = function(flower){
        $scope.flowers.splice( $scope.flowers.indexOf(flower), 1 );
      };

      $scope.removeAll = function(){
        $scope.flowers.remove();
      };

      $scope.createFlowerLabel = function (flowerId) {
          var flower = $meteor.collection(function() {
            return Flowers.find({_id: flowerId})
          });

          var hasLogo = true;
          var processorHasLogo = true;
          var processedBy;
          var farm = $meteor.collection(function(){
            return Farms.find({name: flower[0].farm})
          })
          var hybrid = false;
          var logoUrl = farm[0].logoUrl;
          var processorUrl;

          if (logoUrl === undefined ) {
            hasLogo = false;
            logoUrl = farm[0].name;
          }

          if (flower[0].processor) {
            processedBy = $meteor.collection(function () {
              return Farms.find({name: flower[0].processedBy})
            })

            if (processedBy[0].logoUrl === undefined) {
              processorHasLogo = false;
              processorUrl = processedBy[0].name
            }else {
              processorUrl = processedBy[0].logoUrl;
            }

          }

          if (!flower[0].terpeneProfile) {
            flower[0].terpeneOneValue = "N/A";
            flower[0].terpeneTwoValue = "N/A";
            flower[0].terpeneOne = "α-Bisabolol";
            flower[0].terpeneTwo = "β-Caryophyllene";
            flower[0].terpeneSum = "N/A";
          }

          AntiModals.overlay('canvasModal', {
           modal: true,
           overlayClass: 'yellow',
          });

          // create a wrapper around native canvas element (with id="c")
          var canvas = new fabric.Canvas('c');
          var dim = {width: 1230, height: 615};
          canvas.setBackgroundColor('white');
          canvas.setDimensions(dim);

          // create a header object 615 x 75
          var headerContainter = new fabric.Rect({
            left: 0,
            top: 0,
            fill: 'white',
            width: 615,
            height: 75
          });



          //create contrainer for type of product label
          var labelContainer = new fabric.Rect({
            left: 0,
            top: 0,
            fill: 'White',
            width: 300,
            height: 75
          });

          //create label
          var labelText = new fabric.Text(flower[0].productType, {
            left: labelContainer.width / 2,
            top: ( labelContainer.height / 2 ) - 20,
            fontFamily: 'Gotham-Black',
            fill:'black',
            fontSize:36,
            textAlign: 'left'
          });

          var pos = {x: 40 , y: 15};

          labelText.setPositionByOrigin(pos, 'left', 'top');

          switch (flower[0].type) {

            case "Sativa" :

              //create container for flower type
              var typeContainer = new fabric.Rect({
                left: 300,
                top: 0,
                fill: '#da1e1e',
                width: 315,
                height: 75
              });

              //create type label
              var typeText = new fabric.Text("SATIVA", {
                left: 0,
                top: 0,
                fontFamily: 'Gotham-Bold',
                fill:'white',
                fontSize:50,
                textAlign: 'center'
              });

              var pos = {x: (typeContainer.left + (typeContainer.width / 2) ) , y: 10};

              typeText.setPositionByOrigin(pos, 'middle', 'top');

              break;

            case "Sativa Dominant Hybrid" :
              hybrid = true;

              //create container for flower type
              var typeContainer = new fabric.Rect({
                left: 300,
                top: 0,
                fill: '#da1e1e',
                width: 315,
                height: 75
              });

              //create type label
              var typeText = new fabric.Text("SATIVA", {
                left: 0,
                top: 0,
                fontFamily: 'Gotham-Bold',
                fill:'white',
                fontSize:44,
                textAlign: 'center'
              });

              var pos = { x: ( typeContainer.left + (typeContainer.width / 2) ) , y: 0 };

              typeText.setPositionByOrigin(pos, 'middle', 'top');

              var typeDominantText = new fabric.Text("DOMINANT", {
                left: 0,
                top: 0,
                fontFamily: 'Gotham-Bold',
                fill:'white',
                fontSize:30,
                textAlign: 'center'
              });

              var pos = { x: ( typeContainer.left + (typeContainer.width / 2) ) , y: ( typeText.top + typeText.height ) - 17};

              typeDominantText.setPositionByOrigin(pos, 'middle', 'top');

              break;

            case "Indica" :
              //create container for flower type
              var typeContainer = new fabric.Rect({
                left: 300,
                top: 0,
                fill: '#a319d0',
                width: 315,
                height: 75
              });

              //create type label
              var typeText = new fabric.Text("INDICA", {
                left: 0,
                top: 0,
                fontFamily: 'Gotham-Bold',
                fill:'white',
                fontSize:50,
                textAlign: 'center'
              });

              var pos = {x: (typeContainer.left + (typeContainer.width / 2) ) , y: 10};

              typeText.setPositionByOrigin(pos, 'middle', 'top');

              break;

            case "Indica Dominant Hybrid" :
              hybrid = true;

              //create container for flower type
              var typeContainer = new fabric.Rect({
                left: 300,
                top: 0,
                fill: '#a319d0',
                width: 315,
                height: 75
              });

              //create type label
              var typeText = new fabric.Text("INDICA", {
                left: 0,
                top: 0,
                fontFamily: 'Gotham-Bold',
                fill:'white',
                fontSize:45,
                textAlign: 'center'
              });

              var pos = { x: ( typeContainer.left + (typeContainer.width / 2) ) , y: 0 };

              typeText.setPositionByOrigin(pos, 'middle', 'top');

              var typeDominantText = new fabric.Text("DOMINANT", {
                left: 0,
                top: 0,
                fontFamily: 'Gotham-Bold',
                fill:'white',
                fontSize:29,
                textAlign: 'center'
              });

              var pos = { x: ( typeContainer.left + (typeContainer.width / 2) ) , y: ( typeText.top + typeText.height ) - 17};

              typeDominantText.setPositionByOrigin(pos, 'middle', 'top');

              break;

            case "Hybrid 50/50" :
              //create container for flower type
              var typeContainer = new fabric.Rect({
                left: 300,
                top: 0,
                fill: '#197b30',
                width: 315,
                height: 75
              });

              //create type label
              var typeText = new fabric.Text("HYBRID", {
                left: 0,
                top: 0,
                fontFamily: 'Gotham-Bold',
                fill:'white',
                fontSize:50,
                textAlign: 'center'
              });

              var pos = {x: (typeContainer.left + (typeContainer.width / 2) ) , y: 10};

              typeText.setPositionByOrigin(pos, 'middle', 'top');

              break;

            default :

          }

          var titleText = new fabric.Text(flower[0].name.toUpperCase(), {
            left: 0,
            top: 0,
            fontFamily: 'Gotham-Black',
            fill:'black',
            fontSize:72,
            textAlign: 'center'
          });

          var pos = {x: 615 / 2  , y: 138};

          titleText.setPositionByOrigin(pos, 'middle', 'top');

          var newPoint = titleText.top + titleText.height;
          var lineWidth = 475 ;

          var underline = new fabric.Rect({
            left: 0,
            top: 0,
            fill: 'black',
            width: lineWidth,
            height: 2
          });

          var pos = {x: 615 / 2  , y: newPoint};

          underline.setPositionByOrigin(pos, 'middle', 'top');


          var subTitleText = new fabric.Text(flower[0].origin, {
            left: 0,
            top: 0,
            fontFamily: 'Gotham-Light',
            fill:'black',
            fontSize:30,
            textAlign: 'center'
          });

          var pos = {x: 615 / 2  , y: newPoint + 20};

          subTitleText.setPositionByOrigin(pos, 'middle', 'top');

          var grownByContainer = new fabric.Rect({
            left: 0,
            top: subTitleText.top + subTitleText.height + 45,
            fill: 'black',
            width: 615,
            height: 50
          });

          var grownByText = "GROWN BY";

          if (flower[0].processor) {
            grownByText = "GROWN BY / PROCESSED BY";
          }

          var grownByText = new fabric.Text(grownByText, {
            left: 0,
            top: 0,
            fontFamily: 'Gotham-Bold',
            fill:'white',
            fontSize:24,
            textAlign: 'center'
          });

          var pos = {x: (615/2) , y: grownByContainer.top + grownByContainer.height / 2 - 10};

          grownByText.setPositionByOrigin(pos, 'middle', 'top');

          //right side left 615

          //create contrainer for top header right side
          var topHeaderContainer = new fabric.Rect({
            left: 615,
            top: 0,
            fill: 'black',
            width: 615,
            height: 50,
            hasControls: false
          });

          //create contrainer for top header right side
          var bottomHeaderContainer = new fabric.Rect({
            left: 615,
            top: 375,
            fill: 'black',
            width: 615,
            height: 50,
            hasControls: false
          });

          //header text top and bottom right side

          var trackingHeaderText = new fabric.Text("TRACKING #", {
            left: 615 + 35,
            top: 15,
            fontFamily: 'Gotham-Bold',
            fill:'white',
            fontSize:20,
            textAlign: 'center'
          });

          var trackingText = new fabric.Text("233813", {
            left: 615 + 35,
            top: 35,
            fontFamily: 'Gotham-Bold',
            fill:'black',
            fontSize:24,
            textAlign: 'center'
          });

          var pos = {x: trackingHeaderText.left + (trackingHeaderText.width / 2), y: 55}
          trackingText.setPositionByOrigin(pos, 'middle', 'top');

          var testedByHeaderText = new fabric.Text("TESTED BY", {
            left: trackingHeaderText.left + trackingHeaderText.width + 70,
            top: 15,
            fontFamily: 'Gotham-Bold',
            fill:'white',
            fontSize:20,
            textAlign: 'center'
          });

          var pos = {x: (615/2) + 615, y: 15}
          testedByHeaderText.setPositionByOrigin(pos, 'middle', 'top');

          var testedByText = new fabric.Text(flower[0].testedBy, {
            left: trackingHeaderText.left + trackingHeaderText.width + 70,
            top: 55,
            fontFamily: 'Gotham-Bold',
            fill:'black',
            fontSize:24,
            textAlign: 'center'
          });

          var pos = {x: (615/2) + 615, y: 55}
          testedByText.setPositionByOrigin(pos, 'middle', 'top');

          var dateHeaderText = new fabric.Text("DATE", {
            left: testedByHeaderText.left + testedByHeaderText.width + 110,
            top: 15,
            fontFamily: 'Gotham-Bold',
            fill:'white',
            fontSize:20,
            textAlign: 'center'
          });

          var dateText = new fabric.Text(flower[0].testedOn, {
            left: 615 + 35,
            top: 35,
            fontFamily: 'Gotham-Bold',
            fill:'black',
            fontSize:24,
            textAlign: 'center'
          });

          var pos = {x: dateHeaderText.left + (dateHeaderText.width / 2), y: 55}
          dateText.setPositionByOrigin(pos, 'middle', 'top');


          var terpeneHeaderText = new fabric.Text("TERPENE PROFILE", {
            left: (615/2) + 615,
            top: 375 + 15,
            fontFamily: 'Gotham-Bold',
            fill:'white',
            fontSize:20,
            textAlign: 'center'
          });

          var pos = {x: (615/2) + 615, y: 375 + 15}
          terpeneHeaderText.setPositionByOrigin(pos, 'middle', 'top');

          var terpeneHeaderKey = new fabric.Text("mg/g", {
            left: (615/2) + 615,
            top: 375 + 15,
            fontFamily: 'Gotham-Bold',
            fill:'white',
            fontSize:20,
            textAlign: 'center'
          });

          var pos = {x: 1146, y: 375 + 15}
          terpeneHeaderKey.setPositionByOrigin(pos, 'left', 'top');


          var totalCannabinoidsContainer = new fabric.Rect({
            left: 615 + 35,
            top: 110,
            fill: 'black',
            width: 167,
            height: 112
          });

          var totalCannabinoidsContainerInner = new fabric.Rect({
            left: 615 + 35 + 3,
            top: 110 + 3,
            fill: 'white',
            width: 167 - 6,
            height: 112 - 6
          });

          var totalCannabinoidsHeader = new fabric.Rect({
            left: totalCannabinoidsContainerInner.left + (totalCannabinoidsContainerInner.width / 2) - (93/2),
            top: 110 + 3,
            fill: 'black',
            width: 93,
            height: 27
          });

          var totalCannabinoidsHeaderText = new fabric.Text("TOTAL", {
            left: totalCannabinoidsContainerInner.left + (totalCannabinoidsContainerInner.width / 2),
            top: 110 + 3,
            fontFamily: 'Gotham-Bold',
            fill:'white',
            fontSize:17,
            textAlign: 'center'
          });

          var pos = {x: totalCannabinoidsContainerInner.left + (totalCannabinoidsContainerInner.width / 2), y: 110 + 3}
          totalCannabinoidsHeaderText.setPositionByOrigin(pos, 'middle', 'top');


          var totalCannabinoidsValue = new fabric.Text(flower[0].totalCannabinoids, {
            left: totalCannabinoidsContainerInner.left + (totalCannabinoidsContainerInner.width / 2),
            top: totalCannabinoidsContainerInner.top + (totalCannabinoidsContainerInner.height / 2),
            fontFamily: 'Gotham-Bold',
            fill:'black',
            fontSize:42,
            textAlign: 'center'
          });

          var pos = {x: totalCannabinoidsValue.left, y: totalCannabinoidsValue.top - (totalCannabinoidsValue.height/2) + 10}
          totalCannabinoidsValue.setPositionByOrigin(pos, 'middle', 'top');


          var totalCannabinoidsPercent = new fabric.Text("%", {
            left: totalCannabinoidsContainerInner.left + totalCannabinoidsContainerInner.width,
            top: totalCannabinoidsContainerInner.top + totalCannabinoidsContainerInner.height,
            fontFamily: 'Gotham-Bold',
            fill:'#959595',
            fontSize:27,
            textAlign: 'center'
          });

          var pos = {x: totalCannabinoidsPercent.left - 3, y: totalCannabinoidsPercent.top + 5}
          totalCannabinoidsPercent.setPositionByOrigin(pos, 'right', 'bottom');


          var thcContainer = new fabric.Rect({
            left: totalCannabinoidsContainer.left + totalCannabinoidsContainer.width + 15,
            top: 110,
            fill: 'black',
            width: 167,
            height: 112
          });

          var thcContainerInner = new fabric.Rect({
            left: totalCannabinoidsContainer.left + totalCannabinoidsContainer.width + 15 + 3,
            top: 110 + 3,
            fill: 'white',
            width: 167 - 6,
            height: 112 - 6
          });

          var thcContainerHeader = new fabric.Rect({
            left: thcContainerInner.left + (thcContainerInner.width / 2) - (93/2),
            top: 110 + 3,
            fill: 'black',
            width: 93,
            height: 27
          });

          var thcContainerHeaderText = new fabric.Text("THC", {
            left: thcContainerInner.left + (thcContainerInner.width / 2),
            top: 110 + 3,
            fontFamily: 'Gotham-Bold',
            fill:'white',
            fontSize:17,
            textAlign: 'center'
          });

          var pos = {x: thcContainerInner.left + (thcContainerInner.width / 2), y: 110 + 3}
          thcContainerHeaderText.setPositionByOrigin(pos, 'middle', 'top');


          var thcValue = new fabric.Text(flower[0].thc, {
            left: thcContainerInner.left + (thcContainerInner.width / 2),
            top: thcContainerInner.top + (thcContainerInner.height / 2),
            fontFamily: 'Gotham-Bold',
            fill:'black',
            fontSize:42,
            textAlign: 'center'
          });

          var pos = {x: thcValue.left, y: thcValue.top - (thcValue.height/2) + 10}
          thcValue.setPositionByOrigin(pos, 'middle', 'top');


          var thcPercent = new fabric.Text("%", {
            left: thcContainerInner.left + thcContainerInner.width,
            top: thcContainerInner.top + thcContainerInner.height,
            fontFamily: 'Gotham-Bold',
            fill:'#959595',
            fontSize:27,
            textAlign: 'center'
          });

          var pos = {x: thcPercent.left - 3, y: thcPercent.top + 5}
          thcPercent.setPositionByOrigin(pos, 'right', 'bottom');

          var thcaContainer = new fabric.Rect({
            left: thcContainer.left + thcContainer.width + 15,
            top: 110,
            fill: 'black',
            width: 167,
            height: 112
          });

          var thcaContainerInner = new fabric.Rect({
            left: thcContainer.left + thcContainer.width + 15 + 3,
            top: 110 + 3,
            fill: 'white',
            width: 167 - 6,
            height: 112 - 6
          });

          var thcaContainerHeader = new fabric.Rect({
            left: thcaContainerInner.left + (thcaContainerInner.width / 2) - (93/2),
            top: 110 + 3,
            fill: 'black',
            width: 93,
            height: 27
          });

          var thcaContainerHeaderText = new fabric.Text("THCa", {
            left: thcaContainerInner.left + (thcaContainerInner.width / 2),
            top: 110 + 3,
            fontFamily: 'Gotham-Bold',
            fill:'white',
            fontSize:17,
            textAlign: 'center'
          });

          var pos = {x: thcaContainerInner.left + (thcaContainerInner.width / 2), y: 110 + 3}
          thcaContainerHeaderText.setPositionByOrigin(pos, 'middle', 'top');

          var thcaValue = new fabric.Text(flower[0].thca, {
            left: thcaContainerInner.left + (thcaContainerInner.width / 2),
            top: thcaContainerInner.top + (thcaContainerInner.height / 2),
            fontFamily: 'Gotham-Bold',
            fill:'black',
            fontSize:42,
            textAlign: 'center'
          });

          var pos = {x: thcaValue.left, y: thcaValue.top - (thcaValue.height/2) + 10}
          thcaValue.setPositionByOrigin(pos, 'middle', 'top');

          var thcaPercent = new fabric.Text("%", {
            left: thcaContainerInner.left + thcaContainerInner.width,
            top: thcaContainerInner.top + thcaContainerInner.height,
            fontFamily: 'Gotham-Bold',
            fill:'#959595',
            fontSize:27,
            textAlign: 'center'
          });

          var pos = {x: thcaPercent.left - 3, y: thcaPercent.top + 5}
          thcaPercent.setPositionByOrigin(pos, 'right', 'bottom');

          //build 3 box 167x112

          var cbdContainer = new fabric.Rect({
            left: 615 + 35,
            top: totalCannabinoidsContainer.top + totalCannabinoidsContainer.height + 15,
            fill: 'black',
            width: 167,
            height: 112
          });

          var cbdContainerInner = new fabric.Rect({
            left: 615 + 35 + 3,
            top: totalCannabinoidsContainer.top + totalCannabinoidsContainer.height + 15 + 3,
            fill: 'white',
            width: 167 - 6,
            height: 112 - 6
          });

          var cbdContainerHeader = new fabric.Rect({
            left: cbdContainerInner.left + (cbdContainerInner.width / 2) - (93/2),
            top: cbdContainerInner.top,
            fill: 'black',
            width: 93,
            height: 27
          });

          var cbdContainerHeaderText = new fabric.Text("CBD", {
            left: cbdContainerInner.left + (cbdContainerInner.width / 2),
            top: 110 + 3,
            fontFamily: 'Gotham-Bold',
            fill:'white',
            fontSize:17,
            textAlign: 'center'
          });

          var pos = {x: cbdContainerInner.left + (cbdContainerInner.width / 2), y: cbdContainerInner.top}
          cbdContainerHeaderText.setPositionByOrigin(pos, 'middle', 'top');

          var cbdValue = new fabric.Text(flower[0].cbd, {
            left: cbdContainerInner.left + (cbdContainerInner.width / 2),
            top: cbdContainerInner.top + (cbdContainerInner.height / 2),
            fontFamily: 'Gotham-Bold',
            fill:'black',
            fontSize:42,
            textAlign: 'center'
          });

          var pos = {x: cbdValue.left, y: cbdValue.top - (cbdValue.height/2) + 10}
          cbdValue.setPositionByOrigin(pos, 'middle', 'top');

          var cbdPercent = new fabric.Text("%", {
            left: cbdContainerInner.left + cbdContainerInner.width,
            top: cbdContainerInner.top + cbdContainerInner.height,
            fontFamily: 'Gotham-Bold',
            fill:'#959595',
            fontSize:27,
            textAlign: 'center'
          });

          var pos = {x: cbdPercent.left - 3, y: cbdPercent.top + 5}
          cbdPercent.setPositionByOrigin(pos, 'right', 'bottom');

          var cbgContainer = new fabric.Rect({
            left: totalCannabinoidsContainer.left + totalCannabinoidsContainer.width + 15,
            top: totalCannabinoidsContainer.top + totalCannabinoidsContainer.height + 15,
            fill: 'black',
            width: 167,
            height: 112
          });

          var cbgContainerInner = new fabric.Rect({
            left: totalCannabinoidsContainer.left + totalCannabinoidsContainer.width + 15 + 3,
            top: totalCannabinoidsContainer.top + totalCannabinoidsContainer.height + 15 + 3,
            fill: 'white',
            width: 167 - 6,
            height: 112 - 6
          });

          var cbgContainerHeader = new fabric.Rect({
            left: cbgContainerInner.left + (cbgContainerInner.width / 2) - (93/2),
            top: cbgContainerInner.top,
            fill: 'black',
            width: 93,
            height: 27
          });

          var cbgContainerHeaderText = new fabric.Text("CBG", {
            left: cbgContainerInner.left + (cbgContainerInner.width / 2),
            top: 110 + 3,
            fontFamily: 'Gotham-Bold',
            fill:'white',
            fontSize:17,
            textAlign: 'center'
          });

          var pos = {x: cbgContainerInner.left + (cbgContainerInner.width / 2), y: cbgContainerInner.top}
          cbgContainerHeaderText.setPositionByOrigin(pos, 'middle', 'top');

          var cbgValue = new fabric.Text(flower[0].cbg, {
            left: cbgContainerInner.left + (cbgContainerInner.width / 2),
            top: cbgContainerInner.top + (cbgContainerInner.height / 2),
            fontFamily: 'Gotham-Bold',
            fill:'black',
            fontSize:42,
            textAlign: 'center'
          });

          var pos = {x: cbgValue.left, y: cbgValue.top - (cbgValue.height/2) + 10}
          cbgValue.setPositionByOrigin(pos, 'middle', 'top');


          var cbgPercent = new fabric.Text("%", {
            left: cbgContainerInner.left + cbgContainerInner.width,
            top: cbgContainerInner.top + cbgContainerInner.height,
            fontFamily: 'Gotham-Bold',
            fill:'#959595',
            fontSize:27,
            textAlign: 'center'
          });

          var pos = {x: cbgPercent.left - 3, y: cbgPercent.top + 5}
          cbgPercent.setPositionByOrigin(pos, 'right', 'bottom');


          var cbnContainer = new fabric.Rect({
            left: thcContainer.left + thcContainer.width + 15,
            top: totalCannabinoidsContainer.top + totalCannabinoidsContainer.height + 15,
            fill: 'black',
            width: 167,
            height: 112
          });

          var cbnContainerInner = new fabric.Rect({
            left: thcContainer.left + thcContainer.width + 15 + 3,
            top: totalCannabinoidsContainer.top + totalCannabinoidsContainer.height + 15 + 3,
            fill: 'white',
            width: 167 - 6,
            height: 112 - 6
          });

          var cbnContainerHeader = new fabric.Rect({
            left: cbnContainerInner.left + (cbnContainerInner.width / 2) - (93/2),
            top: cbnContainerInner.top,
            fill: 'black',
            width: 93,
            height: 27
          });

          var cbnContainerHeaderText = new fabric.Text("CBN", {
            left: cbnContainerInner.left + (cbnContainerInner.width / 2),
            top: 110 + 3,
            fontFamily: 'Gotham-Bold',
            fill:'white',
            fontSize:17,
            textAlign: 'center'
          });

          var pos = {x: cbnContainerInner.left + (cbnContainerInner.width / 2), y: cbnContainerInner.top}
          cbnContainerHeaderText.setPositionByOrigin(pos, 'middle', 'top');

          var cbnValue = new fabric.Text(flower[0].cbn, {
            left: cbnContainerInner.left + (cbnContainerInner.width / 2),
            top: cbnContainerInner.top + (cbnContainerInner.height / 2),
            fontFamily: 'Gotham-Bold',
            fill:'black',
            fontSize:42,
            textAlign: 'center'
          });

          var pos = {x: cbnValue.left, y: cbnValue.top - (cbnValue.height/2) + 10}
          cbnValue.setPositionByOrigin(pos, 'middle', 'top');

          var cbnPercent = new fabric.Text("%", {
            left: cbnContainerInner.left + cbnContainerInner.width,
            top: cbnContainerInner.top + cbnContainerInner.height,
            fontFamily: 'Gotham-Bold',
            fill:'#959595',
            fontSize:27,
            textAlign: 'center'
          });

          var pos = {x: cbnPercent.left - 3, y: cbnPercent.top + 5}
          cbnPercent.setPositionByOrigin(pos, 'right', 'bottom');


          //terpenes profile section

          var terpene1Text = new fabric.Text(flower[0].terpeneOne, {
            left: 615 + 45,
            top: bottomHeaderContainer.top + bottomHeaderContainer.height + 20,
            fontFamily: 'Gotham-Book',
            fill:'black',
            fontSize:34,
            textAlign: 'left'
          });

          var terpene1Amount = new fabric.Text(flower[0].terpeneOneValue, {
            left: 1230,
            top: bottomHeaderContainer.top + bottomHeaderContainer.height + 20,
            fontFamily: 'Gotham-Book',
            fill:'black',
            fontSize:34,
            textAlign: 'right'
          });

          var pos = {x: canvas.width - 20, y: terpene1Amount.top}
          terpene1Amount.setPositionByOrigin(pos, 'right', 'top');


          var terpene2Text = new fabric.Text(flower[0].terpeneTwo, {
            left: 615 + 45,
            top: terpene1Text.top + terpene1Text.height + 5,
            fontFamily: 'Gotham-Book',
            fill:'black',
            fontSize:34,
            textAlign: 'left'
          });

          var terpene2Amount = new fabric.Text(flower[0].terpeneTwoValue, {
            left: 1230,
            top: terpene1Text.top + terpene1Text.height + 5,
            fontFamily: 'Gotham-Book',
            fill:'black',
            fontSize:34,
            textAlign: 'right'
          });

          var pos = {x: canvas.width - 20, y: terpene2Amount.top}
          terpene2Amount.setPositionByOrigin(pos, 'right', 'top');

          var terpeneTotalText = new fabric.Text("Total Sum of Terpenes", {
            left: 615 + 45,
            top: terpene2Text.top + terpene2Text.height + 5,
            fontFamily: 'Gotham-Bold',
            fill:'black',
            fontSize:34,
            textAlign: 'left'
          });

          var terpeneTotalAmount = new fabric.Text(flower[0].terpeneSum, {
            left: 1230,
            top: terpene2Text.top + terpene2Text.height + 5,
            fontFamily: 'Gotham-Bold',
            fill:'black',
            fontSize:34,
            textAlign: 'right'
          });

          var pos = {x: canvas.width - 20, y: terpeneTotalAmount.top}
          terpeneTotalAmount.setPositionByOrigin(pos, 'right', 'top');

          //farm name, if no logo is present

          var farmNameArray = flower[0].farm.split(" ");

          if (flower[0].processedBy === undefined) {
            var processorNameArray = []
          } else {
            var processorNameArray = flower[0].processedBy.split(" ");
          }


          var farmName = new fabric.Text(flower[0].farm, {
            left: 0,
            top: 0,
            fontFamily: 'Gotham-Bold',
            fill:'black',
            fontSize:45,
            textAlign: 'center'
          });

          var subtraction = canvas.height - (grownByContainer.top + grownByContainer.height)

          var processorName = new fabric.Text(flower[0].processedBy, {
            left: 0,
            top: 0,
            fontFamily: 'Gotham-Bold',
            fill:'black',
            fontSize:30,
            textAlign: 'center'
          });


          //
          //
          //   // "add" everything onto canvas
             canvas.add(headerContainter);
             canvas.add(labelContainer);
             canvas.add(labelText);
             canvas.add(typeContainer);
             canvas.add(typeText);
             if (hybrid) {
               canvas.add(typeDominantText);
             }
             canvas.add(titleText);
             canvas.add(subTitleText);
            //  canvas.add(addRectangle);
            //  canvas.add(addText);
             canvas.add(underline);
             canvas.add(grownByContainer);
             canvas.add(grownByText);
             canvas.add(topHeaderContainer);
             canvas.add(bottomHeaderContainer);
             canvas.add(trackingHeaderText);
             canvas.add(trackingText);
             canvas.add(testedByHeaderText);
             canvas.add(testedByText);
             canvas.add(dateHeaderText);
             canvas.add(dateText);
             canvas.add(terpeneHeaderText);
             canvas.add(terpeneHeaderKey);
             canvas.add(totalCannabinoidsContainer);
             canvas.add(totalCannabinoidsContainerInner);
             canvas.add(totalCannabinoidsHeader);
             canvas.add(totalCannabinoidsHeaderText);
             canvas.add(totalCannabinoidsValue);
             canvas.add(totalCannabinoidsPercent);
             canvas.add(thcContainer);
             canvas.add(thcContainerInner);
             canvas.add(thcContainerHeader);
             canvas.add(thcContainerHeaderText);
             canvas.add(thcValue);
             canvas.add(thcPercent);
             canvas.add(thcaContainer);
             canvas.add(thcaContainerInner);
             canvas.add(thcaContainerHeader);
             canvas.add(thcaContainerHeaderText);
             canvas.add(thcaValue);
             canvas.add(thcaPercent);
             canvas.add(cbdContainer);
             canvas.add(cbdContainerInner);
             canvas.add(cbdContainerHeader);
             canvas.add(cbdContainerHeaderText);
             canvas.add(cbdValue);
             canvas.add(cbdPercent);
             canvas.add(cbgContainer);
             canvas.add(cbgContainerInner);
             canvas.add(cbgContainerHeader);
             canvas.add(cbgContainerHeaderText);
             canvas.add(cbgValue);
             canvas.add(cbgPercent);
             canvas.add(cbnContainer);
             canvas.add(cbnContainerInner);
             canvas.add(cbnContainerHeader);
             canvas.add(cbnContainerHeaderText);
             canvas.add(cbnValue);
             canvas.add(cbnPercent);
             canvas.add(terpene1Text);
             canvas.add(terpene2Text);
             canvas.add(terpeneTotalText);
             canvas.add(terpene1Amount);
             canvas.add(terpene2Amount);
             canvas.add(terpeneTotalAmount);

             if (flower[0].processor) {

               if (hasLogo) {

                 fabric.Image.fromURL(logoUrl, function(oImg) {

                   var subtraction = canvas.height - (grownByContainer.top + grownByContainer.height)

                   var pos = {x: ((canvas.width/4) / 2), y: canvas.height - (subtraction/2)};
                   //var pos = {x: ((canvas.width/4) / 2) * 3, y: canvas.height - (subtraction/2)};

                   oImg.setPositionByOrigin(pos, 'center', 'center');

                   canvas.add(oImg);
                 });

               }else {

                 if (farmNameArray.length === 2 ) {
                   farmName.setFontSize("30");

                 }
                 else if (farmNameArray.length === 3) {
                   farmName.setFontSize("30");

                   farmName.setText(farmNameArray[0] + " " + farmNameArray[1] + "\n" + farmNameArray[2])
                 }
                 else {

                 }

                 var pos = {x: ((canvas.width/4) / 2), y: canvas.height - (subtraction/2)};

                 farmName.setPositionByOrigin(pos, 'center', 'center');

                 canvas.add(farmName);

               }

               if (processorHasLogo) {

                 fabric.Image.fromURL(processorUrl, function(oImg) {

                   var subtraction = canvas.height - (grownByContainer.top + grownByContainer.height)

                   var pos = {x: ((canvas.width/4) / 2) * 3, y: canvas.height - (subtraction/2)};
                   //var pos = {x: ((canvas.width/4) / 2) * 3, y: canvas.height - (subtraction/2)};

                   oImg.setPositionByOrigin(pos, 'center', 'center');

                   canvas.add(oImg);
                 });


               }
               else {

                 var pos = {x: ((canvas.width/4) / 2) * 3, y: canvas.height - (subtraction/2)};

                 processorName.setPositionByOrigin(pos, 'center', 'center');

                 if (processorName.length === 2 ) {
                   processorName.setFontSize("30");
                 }
                 else if (processorNameArray.length === 3) {
                   processorName.setFontSize("30");

                   processorName.setText(processorNameArray[0] + " " + processorNameArray[1] + "\n" + processorNameArray[2])
                 }
                 else {

                 }

                 canvas.add(processorName)
               }



             } else {

               if (hasLogo) {

                 fabric.Image.fromURL(logoUrl, function(oImg) {

                   var subtraction = canvas.height - (grownByContainer.top + grownByContainer.height)

                   var pos = {x: canvas.width/4, y: canvas.height - (subtraction/2)};
                   //var pos = {x: ((canvas.width/4) / 2) * 3, y: canvas.height - (subtraction/2)};

                   oImg.setPositionByOrigin(pos, 'center', 'center');

                   canvas.add(oImg);
                 });

               }else {

                 var pos = {x: canvas.width/4, y: canvas.height - (subtraction/2)};

                 farmName.setPositionByOrigin(pos, 'center', 'center');

                 canvas.add(farmName);

               }
             }


             var dataURL = canvas.toDataURL({format: 'png', multiplier: 1});

             //methods

             function hide(which){
                if (!document.getElementById)
                return
                if (which.style.display=="none")
                  return
                else
                which.style.display="none"
              }

             function show(which){
                if (!document.getElementById)
                return
                if (which.style.display=="block")
                  return
                else
                which.style.display="block"
              }

            show(document.getElementById("closeSelect"))

             canvas.on("object:selected", function (options) {

               var typeGroup = document.getElementById("typeSelect")
               var titleGroup = document.getElementById("titleSelect")

               //if type container selected

             })

             canvas.on('mouse:down', function (options) {

               var typeGroup = document.getElementById("typeSelect")
               var titleGroup = document.getElementById("titleSelect")
               var closeGroup = document.getElementById("closeSelect")

               switch (options.target.fill) {
                 case "#da1e1e" :
                   hide(titleGroup)
                   hide(closeGroup)
                   show(typeGroup)
                   break;
                 case "#a319d0" :
                   hide(titleGroup)
                   hide(closeGroup)
                   show(typeGroup)
                   break;
                 case "#197b30" :
                   hide(titleGroup)
                   hide(closeGroup)
                   show(typeGroup)
                   break;
                 default:
                   show(closeGroup)
                   switch (options.target.text) {
                     case flower[0].name.toUpperCase():
                       hide(typeGroup);
                       hide(closeGroup);
                       show(titleGroup);
                       break;
                     case flower[0].origin:
                       console.log(options.target)
                       hide(typeGroup);
                       hide(closeGroup);
                       show(titleGroup);
                       break;
                     case flower[0].farm:
                       hide(typeGroup);
                       hide(closeGroup);
                       show(titleGroup);
                       break;
                     default:
                       console.log(options.target)
                       hide(titleGroup);
                       hide(typeGroup);
                       show(closeGroup);
                   }
               }

             })

             console.log(dataURL);
      };

    }]);

    angular.module("oregonsFinest").controller("NavCtrl", ['$scope', '$meteor',
      function($scope, $meteor){

        $scope.flowers = $meteor.collection(Flowers);

        $scope.farms = $meteor.collection(Farms);

        $scope.searchFilter = function () {
          alert('test')
          // $scope.filterObj = {};
          // $scope.filterObj[name] = $scope.search;
        };

      }]);

  angular.module("oregonsFinest").controller("FlowerDetailsCtrl", ['$scope', '$mdDialog', '$meteor', '$location' , '$stateParams',
    function($scope, $mdDialog, $meteor, $location, $stateParams){

      var flowerId = $stateParams.id;
      $scope.selectedFarm = '';

      $scope.flower = $meteor.collection(function() {
        return Flowers.find({_id: flowerId})
      });

      $scope.flowers = $meteor.collection(Flowers);

      $scope.farms = $meteor.collection(Farms);

      $scope.productTypes = [
        {name: "BHO", value: "BHO"},
        {name: "FLOWER", value: "FLOWER"},
        {name: "SHATTER", value: "SHATTER"}
      ];

      $scope.flowerTypes = [
        {name: "Sativa", value: "Sativa"},
        {name: "Sativa Dominant Hybrid", value: "Sativa Dominant Hybrid" },
        {name: "Indica", value: "Indica"},
        {name: "Indica Dominant Hybrid", value: "Indica Dominant Hybrid"},
        {name: "Hybrid 50/50", value: "Hybrid 50/50"}];

      $scope.labs = [
        {name:"3B Analytical", value:"3B Analytical"},
        {name: "Cascadea Labs", value:"Cascadea Labs"}
      ];

      $scope.processors = $meteor.collection(function () {
        return Farms.find({farmClass: "Processor"});
      })

      $scope.terpenes = [
        { name: "α-Bisabolol", value: "α-Bisabolol" },
        { name: "β-Caryophyllene", value: "β-Caryophyllene" },
        { name: "Caryophyllene oxide", value: "Caryophyllene oxide" },
        { name: "α-Humulene", value: "α-Humulene" },
        { name: "Limonene", value: "Limonene" },
        { name: "Linalool", value: "Linalool" },
        { name: "Myrcene", value: "Myrcene" },
        { name: "α-Pinene", value: "α-Pinene" },
        { name: "β-Pinene", value: "β-Pinene" },
        { name: "Terpinolene", value: "Terpinolene" }
      ];

      $scope.save = function (flower) {
        flower.save().then($location.path('/flowers'))
      }

      $scope.cancelCreateFlower = function () {
        $scope.flower = '';
        $location.path('/flowers');
      }

      $scope.test = function () {
        alert('here');
      }

      $scope.showAlert = function() {
      // Appending dialog to document.body to cover sidenav in docs app
      // Modal dialogs should fully cover application
      // to prevent interaction outside of dialog
      $mdDialog.show(
          $mdDialog.alert()
            .parent(angular.element(document.body))
            .title('This is an alert title')
            .content('You can specify some description text in here.')
            .ariaLabel('Alert Dialog Demo')
            .ok('Got it!')
        );
      };



    }]);

  angular.module("oregonsFinest").controller("FlowerCreateCtrl", ['$scope', '$meteor', '$location' , '$stateParams',
    function($scope, $meteor, $location, $stateParams){

      $scope.flower = '';

      $scope.flowers = $meteor.collection(Flowers);

      $scope.farms = $meteor.collection(Farms);

      $scope.flowerTypes = [
        {name: "Sativa", value: "Sativa"},
        {name: "Sativa Dominant Hybrid", value: "Sativa Dominant Hybrid" },
        {name: "Indica", value: "Indica"},
        {name: "Indica Dominant Hybrid", value: "Indica Dominant Hybrid"},
        {name: "Hybrid 50/50", value: "Hybrid 50/50"}
      ];

      $scope.productTypes = [
        {name: "BHO", value: "BHO"},
        {name: "FLOWER", value: "FLOWER"},
        {name: "SHATTER", value: "SHATTER"}
      ];

      $scope.selectedProductType = $scope.productTypes[0];

      $scope.processors = $meteor.collection(function () {
        return Farms.find({farmClass: "Processor"});
      })

      $scope.selectedProcessor = $scope.processors[0];

      $scope.selectedFlowerType = $scope.flowerTypes[0];

      $scope.labs = [
        {name: "3B Analytical", value:"3B Analytical"},
        {name: "Cascadea Labs", value:"Cascadea Labs"}
      ];

      $scope.selectedLab = $scope.labs[0];

      $scope.terpenes = [
        { name: "α-Bisabolol", value: "α-Bisabolol" },
        { name: "β-Caryophyllene", value: "β-Caryophyllene" },
        { name: "Caryophyllene oxide", value: "Caryophyllene oxide" },
        { name: "α-Humulene", value: "α-Humulene" },
        { name: "Limonene", value: "Limonene" },
        { name: "Linalool", value: "Linalool" },
        { name: "Myrcene", value: "Myrcene" },
        { name: "α-Pinene", value: "α-Pinene" },
        { name: "β-Pinene", value: "β-Pinene" },
        { name: "Terpinolene", value: "Terpinolene" }
      ];

      $scope.selectedTerpenesOne = $scope.terpenes[0];

      $scope.selectedTerpenesTwo = $scope.terpenes[0];

      $scope.cancelCreateFlower = function () {
        $scope.flower = '';
        $location.path('/flowers');
      }

      $scope.save = function (flower) {
        flower.productType = $scope.selectedProductType.name;
        flower.type = $scope.selectedFlowerType.name;
        flower.farm = $scope.selectedFarm;
        flower.testedBy = $scope.selectedLab;

        if ($scope.data.cb1) {
          flower.processor = true;
          flower.processedBy = $scope.selectedProcessor.name;
        }else {
          flower.processedBy = "N/A";
        }

        if ($scope.data.terpeneProfile) {
          flower.terpeneProfile = true;
          flower.terpeneOne = $scope.selectedTerpenesOne.name;
          flower.terpeneTwo = $scope.selectedTerpenesTwo.name;
        }else {
          flower.terpeneProfile = false;
          flower.terpeneOne = "N/A";
          flower.terpeneTwo = "N/A";
          flower.terpeneOneValue = "N/A";
          flower.terpeneTwoValue = "N/A";
        }

        $scope.flowers.push(flower).then(
            $location.path('/flowers')
          );
      }


    }]);

    angular.module("oregonsFinest").controller("FarmsListCtrl", ['$scope', '$meteor',
      function($scope, $meteor){

        $scope.farms = $meteor.collection(Farms);

        $scope.remove = function(farm){
          console.log("test")
          $scope.farms.splice( $scope.farms.indexOf(farm), 1 );
        };

        $scope.removeAll = function(){
          $scope.farms.remove();
        };

      }]);

    angular.module("oregonsFinest").controller("FarmDetailsCtrl", ['$scope', '$location', '$meteor', '$stateParams',
      function($scope, $location, $meteor, $stateParams){

        var farmId = $stateParams.id;

        $scope.farm = $meteor.collection(function() {
          return Farms.find({_id: farmId})
        });

        $scope.farmClasses = [{name: "Grower", value: "Grower"}, {name: "Processor", type: "Processor"}]


        $scope.saveFarm = function (farm) {
          farm.save().then($location.path('/farms'));
        };


      }]);

    angular.module("oregonsFinest").controller("FarmCreateCtrl", ['$scope', '$meteor', '$stateParams', "$location", 'FileUpload',
      function($scope, $meteor, $stateParams, $location, FileUpload){

        $scope.farm = '';

        $scope.farms = $meteor.collection(Farms);

        $scope.farmClasses = [{name: "Grower", value: "Grower"}, {name: "Processor", type: "Processor"}]

        $scope.selectedFarmClass = $scope.farmClasses[0];

        $scope.saveFarm = function (farm) {
          farm.isActive = true;
          farm.logoUrl = FileUpload.getFilePath();
          fileUploaded(true);
          $scope.farms.push(farm);
          $location.path('/farms')
        };


      }]);

    angular.module("oregonsFinest").controller("CanvasModalCtrl", ['$scope', '$meteor', '$stateParams', "$location",
      function($scope, $meteor, $stateParams, $location){
        $scope.test = function () {
          alert('test');
        }
      }]);

    angular.module("oregonsFinest").filter('paginate',

      function(Paginator) {
        return function(input, rowsPerPage) {
            if (!input) {
                return input;
            }

            if (rowsPerPage) {
                Paginator.rowsPerPage = rowsPerPage;
            }

            Paginator.itemCount = input.length;

            return input.slice(parseInt(Paginator.page * Paginator.rowsPerPage), parseInt((Paginator.page + 1) * Paginator.rowsPerPage + 1) - 1);
        }
    });

    angular.module("oregonsFinest").filter('forLoop', function() {
        return function(input, start, end) {
            input = new Array(end - start);
            for (var i = 0; start < end; start++, i++) {
                input[i] = start;
            }

            return input;
        }
    });
    angular.module("oregonsFinest").service('FileUpload', function ($rootScope, $meteor) {
      var uploadedItems = $meteor.collection(Uploads);

      this.getFilePath = function () {
        if (fileWaiting) {
          return uploadedFile.url
        }else {
          return "No File"
        }
      }

      this.getItems = function () {
        return uploadedItems;
      };

    });
    angular.module("oregonsFinest").service('Paginator', function ($rootScope) {
        this.page = 0;
        this.rowsPerPage = 10;
        this.itemCount = 0;

        this.setPage = function (page) {
            if (page > this.pageCount()) {
                return;
            }

            this.page = page;
        };

        this.nextPage = function () {
            if (this.isLastPage()) {
                return;
            }

            this.page++;
        };

        this.perviousPage = function () {
            if (this.isFirstPage()) {
                return;
            }

            this.page--;
        };

        this.firstPage = function () {
            this.page = 0;
        };

        this.lastPage = function () {
            this.page = this.pageCount() - 1;
        };

        this.isFirstPage = function () {
            return this.page == 0;
        };

        this.isLastPage = function () {
            return this.page == this.pageCount() - 1;
        };

        this.pageCount = function () {
            return Math.ceil(parseInt(this.itemCount) / parseInt(this.rowsPerPage));
        };
    });

    angular.module("oregonsFinest").directive('paginator', function factory() {
        return {
            restrict:'E',
            controller: function ($scope, Paginator) {
                $scope.paginator = Paginator;
            },
            templateUrl: 'paginationControl.ng.html'
        };
    });

    angular.module("oregonsFinest").directive( 'goClick', function ( $location ) {
      return function ( scope, element, attrs ) {
        var path;

        attrs.$observe( 'goClick', function (val) {
          path = val;
        });

        element.bind( 'click', function () {
          scope.$apply( function () {
            $location.path( path );
          });
        });
      };
    });


}

if (Meteor.isServer) {

  Meteor.startup(function () {
    if (Flowers.find().count() === 0) {

    }

    if (Items.find().count() === 0) {

    }

    UploadServer.init({
      tmpDir: process.env.PWD + '/.uploads/tmp',
      uploadDir: process.env.PWD + '/.uploads/',
      checkCreateDirectories: true, //create the directories for you

      getDirectory: function(fileInfo, formData) {
        if (formData && formData.directoryName != null) {
          return formData.directoryName;
        }
        return "";
      },
      getFileName: function(fileInfo, formData) {
        if (formData && formData.prefix != null) {
          return formData.prefix + '_' + fileInfo.name;
        }
        return fileInfo.name;
      },
      finished: function(fileInfo, formData) {
        console.log(fileInfo, formData)
        if (formData && formData._id != null) {
          Items.update({_id: formData._id}, { $push: { uploads: fileInfo }});
        }
      }
    })

  });
}

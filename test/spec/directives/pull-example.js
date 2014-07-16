'use strict';

describe('Directive: pullExample', function () {

  // load the directive's module
  beforeEach(module('beastieApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<pull-example></pull-example>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the pullExample directive');
  }));
});
'use strict';

describe('Directive: killExample', function () {

  // load the directive's module
  beforeEach(module('beastieApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<kill-example></kill-example>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the killExample directive');
  }));
});

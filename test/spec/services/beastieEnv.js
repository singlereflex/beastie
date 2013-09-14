'use strict';

describe('Service: beastieEnv', function () {

  // load the service's module
  beforeEach(module('beastieApp'));

  // instantiate service
  var beastieEnv;
  beforeEach(inject(function(_beastieEnv_) {
    beastieEnv = _beastieEnv_;
  }));

  it('should do something', function () {
    expect(!!beastieEnv).toBe(true);
  });

});

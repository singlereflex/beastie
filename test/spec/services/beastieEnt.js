'use strict';

describe('Service: beastieEnt', function () {

  // load the service's module
  beforeEach(module('beastieApp'));

  // instantiate service
  var beastieEnt;
  beforeEach(inject(function(_beastieEnt_) {
    beastieEnt = _beastieEnt_;
  }));

  it('should do something', function () {
    expect(!!beastieEnt).toBe(true);
  });

});

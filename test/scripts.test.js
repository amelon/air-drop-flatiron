var flatiron    = require('flatiron')
  , app         = flatiron.app
  , AirDrop     = require('../air-drop-flatiron')
  , expect      = require('expect.js')
  , request     = require('request');


var port = 8000
  , host = 'http://localhost:'+port;

app.use(flatiron.plugins.http);
app.use(AirDrop);

function waitPathReady(package, done) {
  if (package.paths.length) return done();
  setTimeout(function() {waitPathReady(package, done)}, 5);
}

describe('AirDropFlatiron with /pack.js', function() {
  var package = AirDrop('/pack.js')
                  .include('test/assets/a.js')
                  .require('test/assets/b.js')
                  .useBrowserRequire(false);


  before(function(done) {
    app.init(function () {
      app.start(port, waitPathReady(package, done));
    });
  })

  describe('calling /pack.js', function() {
    it('should return body', function(done) {
      request({url: host+'/pack.js'}, function(err, res, body) {
        if (err) return done(err);
        expect(body).to.be.ok();
        done();
      })
    })    
  })

  describe('calling included pack file a.js', function() {
    it('should return body', function(done) {
      request({url: host+'/pack.js/include/.|test|assets|a.js'}, function(err, res, body) {
        if (err) return done(err);
        expect(body).to.be.ok();          
        done();
      })
    });
  })

  describe('calling required pack file b.js', function() {
    it('should return body', function(done) {
      request({url: host+'/pack.js/require/.|test|assets|b.js'}, function(err, res, body) {
        if (err) return done(err);
        expect(body).to.be.ok();
        done();
      })
    });
  })


})

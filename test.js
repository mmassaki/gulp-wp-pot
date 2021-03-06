'use strict';

/* global describe, it */

var assert = require('assert');
var File   = require('vinyl');
var wpPot  = require('./');

function numberOfMatches(needle, haystack) {
  return (haystack.match(new RegExp(needle, "g")) || []).length;
}

describe('Arguments tests', function () {
  it('should thrown a error when argument is not a object', function () {
    try {
      wpPot(null);
    } catch (e) {
      assert.equal('Require a argument of type object.', e.message);
    }
  });
});

describe('generate tests', function () {
  it ('should generate a pot file from php file', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _e( "Name", "test" ); ?>')
    });
    var stream = wpPot({
      domain: 'test'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf("msgid \"Name\"\n") !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with context', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _x( "Name", "the name", "test" );  ?>')
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf("msgctxt \"the name\"\n") !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with plural', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php sprintf( _n( "%s star", "%s stars", 3, "test" ), 3 ); ?>')
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf("msgid_plural \"%s stars\"\n") !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with plural and context', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php sprintf( _nx( "%s star", "%s stars", 3, "stars translation", "test" ), 3 ); ?>')
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf("msgctxt \"stars translation\"\n") !== -1);
      assert(fileContents.indexOf("msgid \"%s star\"\n") !== -1);
      assert(fileContents.indexOf("msgid_plural \"%s stars\"\n") !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with escaped single quotes', function (done) {
    var testFile = new File({
      contents: new Buffer("<?php __( 'It\\\'s escaped', 'test' ); ?>")
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf('msgid \"It\'s escaped\"\n') !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with unescaped double quotes within single quotes', function (done) {
    var testFile = new File({
      contents: new Buffer("<?php __( 'Hello \"World\"', 'test' ); ?>")
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf('msgid \"Hello \\\"World\\\"\"\n') !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with escaped double quotes', function (done) {
    var testFile = new File({
      contents: new Buffer("<?php __( \"Hello \\\"World\\\"\", 'test' ); ?>")
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf('msgid \"Hello \\\"World\\\"\"\n') !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with line breaks in function argument', function (done) {
    var testFile = new File({
      contents: new Buffer("<?php __( ( \"Hello\nWorld\"), 'test' ); ?>")
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf('msgid \"\"\n\"Hello\\n\"\n\"World\"\n') !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with line breaks in function call', function (done) {
    var testFile = new File({
      contents: new Buffer("<?php __(\n\t\"Hello World\",\n\t'test'\n); ?>")
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf('msgid \"Hello World\"\n') !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with noop function', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _n_noop( "%s star", "%s stars", "test" ); ?>')
    });
    var stream = wpPot({
      domain: 'test'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf("msgid \"%s star\"\n") !== -1);
      assert(fileContents.indexOf("msgid_plural \"%s stars\"\n") !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should only generate one translation line when duplicated strings detected', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _e( "Name", "test" ); _n_noop( "Name", "Names", "test" ); ?>')
    });
    var stream = wpPot({
      domain: 'test'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(numberOfMatches("msgid \"Name\"\n", fileContents) === 1);
      assert(numberOfMatches("msgid_plural \"Names\"\n", fileContents) === 1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });
});

describe('domain tests', function () {
  it ('should generate a pot file from php file with domain set as variable', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _e( "Name", $test ); ?>')
    });
    var stream = wpPot({
      domain: '$test'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf("msgid \"Name\"\n") !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with domain set as a constant', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _e( "Name", TEST ); ?>')
    });
    var stream = wpPot({
      domain: 'TEST'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf("msgid \"Name\"\n") !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with context and domain set as a constant', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _nx_noop( "%s star", "%s stars", "stars translation", TEST ); ?>')
    });
    var stream = wpPot({
      domain: 'TEST'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf("msgctxt \"stars translation\"\n") !== -1);
      assert(fileContents.indexOf("msgid \"%s star\"\n") !== -1);
      assert(fileContents.indexOf("msgid_plural \"%s stars\"\n") !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with no domain set', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _e( "Name", "test" ); _e( "Hello World", "test2" ); ?>')
    });
    var stream = wpPot();
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf("msgid \"Name\"\n") !== -1);
      assert(fileContents.indexOf("msgid \"Hello World\"\n") !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });
});

describe('header tests', function () {
  it ('should generate a pot file with default headers when no headers is set', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _x( "Name", "the name", "test" );  ?>')
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf('X-Poedit-SourceCharset: UTF-8\\n') !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file with custom headers from php file with headers set', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _x( "Name", "the name", "test" );  ?>')
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>',
      headers: {
        'Hello-World': 'This is a test'
      }
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf('Hello-World: This is a test\\n') !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file without default headers from php file with headers false', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _x( "Name", "the name", "test" );  ?>')
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>',
      headers: false
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf('X-Poedit-KeywordsList') === -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });
});

describe('file path tests', function () {
  it ('should generate a pot file with correct file path comments', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _x( "Name", "the name", "test" );  ?>'),
      path: "test/test.php"
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf('#: test/test.php:1') !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file with correct file path comments with Windows styled paths', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _x( "Name", "the name", "test" );  ?>'),
      path: "test\\test.php"
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf('#: test/test.php:1') !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });
});

var AwsSdk = require("nativescript-aws-sdk").AwsSdk;
var awsSdk = new AwsSdk();

describe("greet function", function() {
    it("exists", function() {
        expect(awsSdk.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(awsSdk.greet()).toEqual("Hello, NS");
    });
});
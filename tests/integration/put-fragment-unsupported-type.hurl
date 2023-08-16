# tests/integration/put-fragments-unsupported-type.hurl
# Testing the error generated when attempting to update fragment type with an unsupported type

POST http://localhost:8080/v1/fragments
Content-Type: text/html

[BasicAuth]
user1@email.com:password1

`<h4>This is a fragment!</h4>`

HTTP/1.1 201

[Captures]
url: header "Location"

####################################################################

# Update the fragment we just created
PUT {{url}}
Content-Type: text/css

[BasicAuth]
user1@email.com:password1

`<h4>This is a fragment!</h4>`

HTTP/1.1 415
[Asserts]
header "Content-Type" contains "application/json"
body == "{\"status\":\"error\",\"error\":{\"code\":415,\"message\":\"UNSUPPORTED_CONTENT_TYPE\"}}"

####################################################################

# Make sure that the fragment's contents haven't changed
GET {{url}}

[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/html
Content-Length: 28
[Asserts]
body == "<h4>This is a fragment!</h4>"


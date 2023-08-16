# tests/integration/put-fragment-empty.hurl
# Attempt to replace existent fragment data with an empty value

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
Content-Type: text/html

[BasicAuth]
user1@email.com:password1

` `

HTTP/1.1 400
[Asserts]
header "Content-Type" contains "application/json"
body == "{\"status\":\"error\",\"error\":{\"code\":400,\"message\":\"NO_EMPTY_CONTENT\"}}"


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

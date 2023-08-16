# tests/integration/put-fragment-nonexistent.hurl
# Testing 404 Not Found error

POST http://localhost:8080/v1/fragments
Content-Type: application/json

[BasicAuth]
user1@email.com:password1

`{fragment: 1}`

HTTP/1.1 201

[Captures]
url: header "Location"

####################################################################

# Make sure that the fragment has been created
GET {{url}}

[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json
[Asserts]
body == "{fragment: 1}"

####################################################################

# Update the fragment we just created, using an invalid ID
PUT http://localhost:8080/v1/fragments/invalid-id
Content-Type: application/json

[BasicAuth]
user1@email.com:password1

`{fragment: 1, fragment2: 2}`

HTTP/1.1 404
[Asserts]
header "Content-Type" contains "application/json"
body == "{\"status\":\"error\",\"error\":{\"code\":404,\"message\":\"fragment does not exist for this user\"}}"


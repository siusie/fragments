# tests/integration/get-fragment-data.hurl
# Testing the GET /fragments/:id route

POST http://localhost:8080/v1/fragments
Content-Type: text/plain

[BasicAuth]
user1@email.com:password1

`Hello World!`

HTTP/1.1 201
[Captures]
url: header "Location"

# Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 12
[Asserts]
body == "Hello World!"

# Try to GET the fragment using an invalid id

GET http://localhost:8080/v1/fragments/invalid-id
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

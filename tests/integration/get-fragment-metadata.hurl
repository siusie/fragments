# tests/integration/get-fragment-metadata.hurl
# Testing the GET /fragments/info, GET /fragments/?expand=1 routes

POST http://localhost:8080/v1/fragments
Content-Type: application/json

[BasicAuth]
user2@email.com:password2

`{ "service": "DynamoDB" }`

HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# Try to GET fragment1's metadata
GET {{fragment1_url}}/info
[BasicAuth]
user2@email.com:password2

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment1_id}}
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 25

####################################################################

# Create another fragment

POST http://localhost:8080/v1/fragments
Content-Type: text/markdown

[BasicAuth]
user2@email.com:password2

`DynamoDB is **great**.`

HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# Try to GET fragment2's metadata
GET {{fragment2_url}}/info

[BasicAuth]
user2@email.com:password2

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment2_id}}
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 22

# GET all fragments of the current user (should get 2 IDs)
GET http://localhost:8080/v1/fragments?expand=1

[BasicAuth]
user2@email.com:password2

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" count == 2
# jsonpath "$.fragments.id" includes "{{fragment1_id, fragment2_id}}"

####################################################################

# Delete the current fragments

DELETE {{fragment1_url}}

[BasicAuth]
user2@email.com:password2

DELETE {{fragment2_url}}

[BasicAuth]
user2@email.com:password2

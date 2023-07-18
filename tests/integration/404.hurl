# Testing HTTP 404 response for nonexistent routes
GET http://localhost:8080/no-such-route

# We expect to get back an HTTP 404
HTTP/1.1 404

[Asserts]
header "Content-Type" contains "application/json"
body == "{\"status\":\"error\",\"error\":{\"code\":404,\"message\":\"not found\"}}"


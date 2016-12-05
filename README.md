# dApi
A http server that merge requests between a dev server and a swagger file.


#### Installation:

```
npm install
```

#### Configuration:
Your config file is in root folder: config.js

```
api: {
    domain: 'http://dev.domain.com',

    auth: {
        overwrite_authentication: false,
        type: 'bearer',
        token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjZkMzliNzcxNzAyNTg4ODQ4ZTQyNWZmMWZiZGY2YmRmN2FmZDFkY2M4ZDcxY2M5ZTlhNTRmNzU4ZTc3NjViZjIzNzNhM2Y3N2UxYmYwMjVjIn0.eyJhdWQiOiIyIiwianRpIjoiNmQzOWI3NzE3MDI1ODg4NDhlNDI1ZmYxZmJkZjZiZGY3YWZkMWRjYzhkNzFjYzllOWE1NGY3NThlNzc2NWJmMjM3M2EzZjc3ZTFiZjAyNWMiLCJpYXQiOjE0Nzk4MzI0MDUsIm5iZiI6MTQ3OTgzMjQwNSwiZXhwIjoyMTEwOTg0NDA1LCJzdWIiOiIzIiwic2NvcGVzIjpbInBjdC1zZXJ2aWNlIl19.NdUCETZ-htrEMg8-vafpmcRHwcehuN3L6ZCqSn0nCtpA28PBKifpuHGWx22Z-P5Q6-G8hZXaoYhwrqPUJ2cnCUlyRf7euWgOoPtOW6Wv8CChuEBJekF3HMKMjykmBwleCtxI5UtW0vPCURDA1ObBVH9IHjE6tDPqqA-LnTq9_R0G1Piy5coeU47S1XjjIltjV1rZ6pNb9Fu_5V9K2ij6iznmwp4uwtND_h1IVZOmBVOkk88OZ7_dr1Y1caaLPmKhdyVgatK2yYp4BI-qut0ZRIxe7PTI8H11QbV-r0UD_mgxQZMHnLC-IWVPaYyleia_8Xsda9hzTaBpxysJn2ijByT5jJfpnGw4d4rdzR2r4aPW6gUiQnB1iP49g8IC7jv-k42-q43958eLISA8NIVgO7422NYNuXfrOpz6cGxT5yb3dG1WYz8GE3yhi_LbrlVbRD5TKnejYblZpDBbW57rbLGW6y44Ou2jC7A6UY_LrGLP2yhmtb3T1lusLOjkrH-MKFwuI4tZKEBxOb7-LMMSNDI8YHxpqTjYrY5PVjIxxnLIngZvpmnwnG9oru9cjnjO1Bvy1-N4afLitkWteqpEwe2oRRDncVtIwNSd-vARAH5983TOMx6BENKAoQkqqQof-Dae-OexPQL6UnHRotHPgsH7RN1OZzG9EQhBr06c1Q8"
    },
},

server: {
    port: 5000
}
```

domain - is the url of the development server.

auth - if your dev API requests need an authentication header you can use 
one direct from dAPI with 'type' and 'token' keys. If you don't want this feature set overwrite_authentication to false

port - is the port where dAPI will run. http://localhost:port

#### Prepare the environment

You need a swagger file in .yaml extension in root folder. 

In your project config set the API url to "localhost:5000" instead your dev server.

Create (rename config.js.example in config.js) a dAPI config file and set your dev API url inside.

Start dAPI server:

```
npm run start
```

Check if dAPI server was started. Type in your browser "http://localhost:5000/dapiconf"

#### How it works

For example you have a dev server (API) for a bookstore. 
Your API has many endpoints including /books which returns an array:
```
[
    {id: 1, title: 'Book1', pages: 333},
    {id: 2, title: 'Book2', pages: 122},
    ...
]
```
The next feature in your business is to get more info about a book.
So you need to develop an action in your controller that make a query and ... you know.

But you can write a part of a swagger file there where you can push all your necessity
and with dAPI, based on that swagger file you can serve a mock object like the real dev server 
without any changes in your project. 

So dAPI check if your request url exist in dev server and if 
exist return the response from dev, else if dev server responds with 404 then dAPI will check 
the swagger file and will return the example from there.

Below is an example of an endpoint in swagger:
```
paths:
  /books:
    get:
      summary: Listing Books
      description: |
        List all books
      parameters:
        - $ref: '#/parameters/pageParam'
        - $ref: '#/parameters/filterParam'
      tags:
        - Fitting
      responses:
        200:
          description: An array of books
          schema:
            type: array
            items:
              $ref: '#/definitions/FittingStyle'
          examples:
            application/json:
              - id: 1
                published_at: "2015-08-05T08:40:51.620Z"
                name: "Book 1"
                status: Pending

              - id: 2
                published_at: "2015-08-05T08:40:51.620Z"
                name: "Book 2"
                status: Pending
```
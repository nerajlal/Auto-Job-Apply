let string = "``` json asfasdfsadfasdfas  ```"
string = string.replace(/`|json/g, "");
console.log(string)

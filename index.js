const fs = require('fs'); // require filesystem package - core node module
const http = require('http');
const url = require('url');


const json = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8'); // a method of the filesystem(specify the file location, specify the character encoding)
const laptopData = JSON.parse(json); // parse the json into a javascript object


const server = http.createServer((req, res) => { //now we will create a server, passing a callback function whcih runs each time someone accesses our web server, which gets access to the request and response objects

    const pathName = url.parse(req.url, true).pathname; //making sure the requested url.pathname is parsed into an object
    console.log(pathName)
    const id = url.parse(req.url, true).query.id; //gives us the id that comes from the query string

    
    // PRODUCT OVERVIEW
    if (pathName === '/products' || pathName === '/') {
        res.writeHead(200, { 'Content-type': 'text/html' }); // we respond with a header saying we have a response (200 ok) and then the type of content it wll be 
        
        fs.readFile(`${__dirname}/templates/template-overview.html`, 'utf-8', (err, data) => {
            
            let overviewOutput = data;

            fs.readFile(`${__dirname}/templates/template-card.html`, 'utf-8', (err, data) => {
            
                const cardsOutput = laptopData.map(el => replaceTemplate(data, el)).join(' ');
                overviewOutput = overviewOutput.replace('{%CARDS%}', cardsOutput);

                res.end(overviewOutput);
            });
        });
    } 

    // LAPTOP DETAIL
    else if (pathName === '/laptop' && id < laptopData.length) {
        res.writeHead(200, { 'Content-type': 'text/html' });
        
        fs.readFile(`${__dirname}/templates/template-laptop.html`, 'utf-8', (err, data) => { // dont use readFileSync() as that would block our code, so we need to use the async version. Pass in path, character encoding and callback function
            const laptop = laptopData[id];
            const output = replaceTemplate(data, laptop);
            res.end(output);
        });
    } 

    // IMAGES
    else if ((/\.(jpg|jpeg|png|gif)$/i).test(pathName)) { // test if pathname contains this regular expression (.jpeg etc). .test is a method available on all JS regular expressions
        fs.readFile(`${__dirname}/data/img${pathName}`, (err, data) => {
            res.writeHead(200, { 'Content-type': 'image/jpg' });
            res.end(data);
        })
    }

    // URL NOT FOUND
    else {
        res.writeHead(404, { 'Content-type': 'text/html' });
        res.end('Url was not found on the server'); // send the response itself (always happens after setting the header) 
    }
});


//take the server we created and use the listen method, always listen on a certain port on a certain ip address
server.listen(1337, '127.0.0.1', () => {
    console.log('server is listening');
});


function replaceTemplate(originalHtml, laptop) {

    let  output = originalHtml.replace(/{%PRODUCTNAME%}/g, laptop.productName); //replace html data in template-laptop.html with the actual product details(using regular expressions) from data.json
    output = output.replace(/{%IMAGE%}/g, laptop.image);
    output = output.replace(/{%PRICE%}/g, laptop.price);
    output = output.replace(/{%SCREEN%}/g, laptop.screen);
    output = output.replace(/{%CPU%}/g, laptop.cpu);
    output = output.replace(/{%STORAGE%}/g, laptop.storage);
    output = output.replace(/{%RAM%}/g, laptop.ram);
    output = output.replace(/{%DESCRIPTION%}/g, laptop.description);
    output = output.replace(/{%ID%}/g, laptop.id);

    return output;
}
